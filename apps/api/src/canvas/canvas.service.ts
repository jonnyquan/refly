import { Inject, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { MINIO_INTERNAL } from '@/common/minio.service';
import { MinioService } from '@/common/minio.service';
import { PrismaService } from '@/common/prisma.service';
import { MiscService } from '@/misc/misc.service';
import { SyncStorageUsageJobData } from '@/subscription/subscription.dto';
import { QUEUE_SYNC_STORAGE_USAGE } from '@/utils/const';
import { CanvasNotFoundError } from '@refly-packages/errors';
import {
  DeleteCanvasRequest,
  ListCanvasesData,
  UpsertCanvasRequest,
  User,
} from '@refly-packages/openapi-schema';
import { genCanvasID } from '@refly-packages/utils';

@Injectable()
export class CanvasService {
  constructor(
    private prisma: PrismaService,
    private miscService: MiscService,
    @Inject(MINIO_INTERNAL) private minio: MinioService,
    @InjectQueue(QUEUE_SYNC_STORAGE_USAGE) private ssuQueue: Queue<SyncStorageUsageJobData>,
  ) {}

  async listCanvases(user: User, param: ListCanvasesData['query']) {
    const { page, pageSize } = param;

    return this.prisma.canvas.findMany({
      where: {
        uid: user.uid,
        deletedAt: null,
      },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  async createCanvas(user: User, canvas: UpsertCanvasRequest) {
    return this.prisma.canvas.create({
      data: {
        uid: user.uid,
        canvasId: genCanvasID(),
        ...canvas,
      },
    });
  }

  async deleteCanvas(user: User, param: DeleteCanvasRequest) {
    const { uid } = user;
    const { canvasId } = param;

    const canvas = await this.prisma.canvas.findFirst({
      where: { canvasId, uid, deletedAt: null },
    });
    if (!canvas) {
      throw new CanvasNotFoundError();
    }

    const cleanups: Promise<any>[] = [
      this.prisma.canvas.update({
        where: { canvasId },
        data: { deletedAt: new Date() },
      }),
      this.miscService.removeFilesByEntity(user, {
        entityId: canvas.canvasId,
        entityType: 'canvas',
      }),
    ];

    if (canvas.storageKey) {
      cleanups.push(this.minio.client.removeObject(canvas.storageKey));
    }

    const files = await this.prisma.staticFile.findMany({
      where: { entityId: canvas.canvasId, entityType: 'canvas' },
    });

    if (files.length > 0) {
      cleanups.push(
        this.prisma.staticFile.deleteMany({
          where: { entityId: canvas.canvasId, entityType: 'canvas' },
        }),
      );
    }

    await Promise.all(cleanups);

    // Sync storage usage
    await this.ssuQueue.add({
      uid,
      timestamp: new Date(),
    });
  }
}
