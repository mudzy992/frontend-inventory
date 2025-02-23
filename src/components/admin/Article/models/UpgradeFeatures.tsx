import { Descriptions } from 'antd';
import React from 'react';

const UpgradeFeatures: React.FC<{ upgradeFeatures: any[] }> = ({ upgradeFeatures }) => {
  return (
    <div>
      {upgradeFeatures.length ? upgradeFeatures?.map(up => (
        <Descriptions>
            <Descriptions.Item className='flex flex-row flex-nowrap' label={up.name}>{up.value} <span className='ml-2 text-default-500 truncate'> - {up.comment}</span></Descriptions.Item>
        </Descriptions>
        )) : "Nema definisanih dodatnih nadogradnji"}
    </div>
  );
};

export default UpgradeFeatures;
