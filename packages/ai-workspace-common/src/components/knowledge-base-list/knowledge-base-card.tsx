import { ReactNode } from 'react';
import { Typography } from '@arco-design/web-react';
import { Collection } from '@refly/openapi-schema';
import './index.scss';
import { Markdown } from '@refly-packages/ai-workspace-common/components/markdown';

interface KnowledgeBaseCardProps {
  cardData: Collection;
  index: number;
  cardIcon?: ReactNode;
  children?: ReactNode;
  onClick: () => void;
}

export const KnowledgeBaseCard = (props: KnowledgeBaseCardProps) => {
  const { children, onClick, cardData } = props;

  return (
    <div
      className="p-4 m-3 border rounded-lg card-box border-black/8"
      id={`collection-${props.index}`}
      onClick={() => onClick()}
    >
      <div className="h-40 overflow-hidden">
        <div className="flex items-center mb-1 resource-url">
          <div className="flex items-center justify-center border rounded-lg card-icon-box shrink-0 border-black/8">
            {props.cardIcon}
          </div>

          <Typography.Text
            ellipsis={{ rows: 2 }}
            style={{ marginBottom: 0, marginLeft: 8, fontWeight: 500, fontSize: '16px' }}
          >
            {props.cardData?.title}
          </Typography.Text>
        </div>

        <div style={{ marginBottom: 0, marginTop: 16, position: 'relative' }}>
          <Markdown content={cardData?.description} fontSize={12} />
        </div>
      </div>

      {children}
    </div>
  );
};