import { Tooltip } from '@nextui-org/react';
import React, { useEffect, useState } from 'react';
import Moment from 'moment';

interface Props {
  createdAt?: Date;
  clientDuo?: Date;
  duoDate?: Date;
  resolveDate?: Date;
  currentDate?: Date;
}

const TimelineProgressBar: React.FC<Props> = ({
  createdAt,
  clientDuo,
  duoDate,
  resolveDate,
}) => {
  const [sortedDataList, setSortedDataList] = useState<Array<{
    id: number;
    name: string;
    date: Date;
    percentage: number;
    label: string;
  }>>([]);

  const dataEntry = (id:number, name: string, date: Date, percentage:number, label:string) => ({ id, name, date, percentage, label });

  useEffect(() => {
    if (createdAt && clientDuo && duoDate && resolveDate) {
      const currentDate = new Date();
      const createdAtPercentage = calculateElapsedTime(createdAt, clientDuo );
      const clientDuoPercentage = calculateElapsedTime(createdAt, clientDuo );
      const duoDatePercentage = calculateElapsedTime(createdAt, duoDate);
      const currentDatePercentage = calculateElapsedTime(currentDate, duoDate);
      const resolveDatePercentage = calculateElapsedTime(createdAt,resolveDate  );

      const createdat = dataEntry(1,"createdAt", createdAt, createdAtPercentage, "Datum prijave");
      const clientDuoDataEntry = dataEntry(2,"clientDuo",  clientDuo, clientDuoPercentage, "Želja klijenta");
      const duoDateDataEntry = dataEntry(3,"duoDate", duoDate, duoDatePercentage, "Predviđeni datum završetka");
      const resolveDateDataEntry = dataEntry(4,"resolvedDate", resolveDate, resolveDatePercentage, "Datum završetka");
      const currentDateDataEntry = dataEntry(5,"currentDate", currentDate, currentDatePercentage, "Trenutni datum");
      const dataList = [createdat, clientDuoDataEntry, duoDateDataEntry, resolveDateDataEntry, currentDateDataEntry];
      const sortedDataList = [...dataList]
            .filter(item => item.percentage > 0)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setSortedDataList(sortedDataList);
    }
  }, [createdAt, clientDuo, duoDate, resolveDate]);

  const calculateElapsedTime = (start:Date, end: Date) => {
    const timeDifference = start.getTime() - end.getTime();
    const totalDuration = 24 * 60 * 60 * 1000;
    const calculate = ((totalDuration - timeDifference) / totalDuration) * 10;
    return calculate;
  };

  return (
    <ol className="sm:flex w-full justify-between">
        {sortedDataList.map((item, index) => {
        const isLastItem = index === sortedDataList.length - 1;

        if (item.percentage > 0) {
            if (item.id !== 5 || !sortedDataList.some((entry) => entry.id === 4)) {
            return (
                <li className={`relative mb-6 sm:mb-0 w-full hidden lg:inline`} key={item.id}>
                <div className="flex items-center">
                    <div className="z-10 flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full ring-0 ring-white dark:bg-blue-900 sm:ring-8 dark:ring-gray-900 shrink-0">
                    <Tooltip showArrow content={
                        <><span>{item.label}</span>
                        <p>{Moment(item.date).format('DD.MM.YYYY - HH:mm')}</p></>
                        }>
                        <svg className="w-2.5 h-2.5 text-blue-800 dark:text-blue-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
                        </svg>
                    </Tooltip>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-0.5 dark:bg-gray-700">
                        <div className={`bg-blue-600 h-0.5`} style={{width:`${item.percentage}%`}} rounded-full></div>
                    </div>
                        {!isLastItem && <div className="hidden sm:flex w-full bg-gray-200 h-0.5 dark:bg-gray-700"> </div>}
                </div>
                <span className='text-tiny flex justify-center top-3'>{item.date.toLocaleDateString()}</span>
                </li>
            );
            }
        }
        return null; 
        })}
    </ol>
  );
};

export default TimelineProgressBar;
