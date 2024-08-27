import { SkillEvent } from '@refly/common-types';
import { Response } from 'express';

export const buildSuccessResponse = <T>(data?: T) => {
  return {
    success: true,
    data,
  };
};

export const writeSSEResponse = (res: Response, msg: SkillEvent) => {
  res.write(`data: ${JSON.stringify(msg)}\n\n`);
};