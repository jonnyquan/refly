import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSubscriptionStoreShallow } from '@refly-packages/ai-workspace-common/stores/subscription';
import { useSubscriptionUsage } from '@refly-packages/ai-workspace-common/hooks/use-subscription-usage';
import { UsageProgress } from './usage-progress';
import { Button } from 'antd';
import { IconSubscription } from '@refly-packages/ai-workspace-common/components/common/icon';

export const SubscriptionHint = memo(() => {
  const { t } = useTranslation();
  const { setSubscribeModalVisible } = useSubscriptionStoreShallow((state) => ({
    setSubscribeModalVisible: state.setSubscribeModalVisible,
  }));

  const { tokenUsage, storageUsage } = useSubscriptionUsage();

  const handleUpgrade = () => {
    setSubscribeModalVisible(true);
  };

  return (
    <div className="w-full rounded-md bg-[#f3f4f8] p-2">
      <div className="mb-1 text-sm font-medium">
        {t('settings.subscription.currentPlan')}:{' '}
        {t(`settings.subscription.subscriptionStatus.free`)}
      </div>

      <UsageProgress
        label={t('settings.subscription.t1Requests')}
        tooltip={
          t('settings.subscription.t1RequestsDescription') +
          ' ' +
          t('settings.subscription.requestsRefresh')
        }
        used={tokenUsage?.t1CountUsed ?? 0}
        quota={tokenUsage?.t1CountQuota ?? 0}
      />

      <UsageProgress
        label={t('settings.subscription.t2Requests')}
        tooltip={
          t('settings.subscription.t2RequestsDescription') +
          ' ' +
          t('settings.subscription.requestsRefresh')
        }
        used={tokenUsage?.t2CountUsed ?? 0}
        quota={tokenUsage?.t2CountQuota ?? 0}
      />

      <UsageProgress
        label={t('settings.subscription.fileCount')}
        tooltip={t('settings.subscription.fileCountDescription')}
        used={storageUsage?.fileCountUsed ?? 0}
        quota={storageUsage?.fileCountQuota ?? 0}
      />

      <div className="mt-2 flex justify-center">
        <Button
          className="w-full"
          type="primary"
          size="middle"
          icon={<IconSubscription className="flex items-center justify-center text-base" />}
          onClick={handleUpgrade}
        >
          <span className="text-sm">{t('settings.subscription.subscribeNow')}</span>
        </Button>
      </div>
    </div>
  );
});

SubscriptionHint.displayName = 'SubscriptionHint';