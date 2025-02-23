import { Descriptions } from 'antd';
import React from 'react';

const TechnicalSpecifications: React.FC<{ article: any }> = ({ article }) => {
  return (
    <div>
      <Descriptions column={1} className="max-h-[200px] overflow-y-auto overflow-hidden">
            {article?.stock?.stockFeatures!.map((feature:any, index:any) => (
            <Descriptions.Item key={index} label={feature.feature?.name}>
                {feature.value}
            </Descriptions.Item>
            ))}
            <Descriptions.Item label="Serijski broj">
            {article?.serialNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Inventorni broj">
            {article?.invNumber}
            </Descriptions.Item>
        </Descriptions>
    </div>
  );
};

export default TechnicalSpecifications;
