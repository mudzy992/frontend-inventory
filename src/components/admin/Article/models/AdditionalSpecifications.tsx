import { Descriptions } from 'antd';
import React from 'react';
import ArticleType from '../../../../types/ArticleType';

const AdditionalSpecifications: React.FC<{ article: ArticleType }> = ({ article }) => {
  return (
    <div>
      {article?.articleFeatures?.length ? article?.articleFeatures?.map((af: any) => (
        <Descriptions key={af.feature?.id}>
            <Descriptions.Item label={af.feature?.name}>{af.featureValue}</Descriptions.Item>
        </Descriptions>
        )) : "Nema definisanih dodatnih specifikacija"}
    </div>
  );
};

export default AdditionalSpecifications;
