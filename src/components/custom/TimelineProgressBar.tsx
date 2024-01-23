import { Tooltip } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import Moment from "moment";

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
  const [sortedDataList, setSortedDataList] = useState<
    Array<{
      id: number;
      name: string;
      date: Date;
      percentage: number;
      label: string;
    }>
  >([]);

  const dataEntry = (
    id: number,
    name: string,
    date: Date,
    percentage: number,
    label: string,
  ) => ({ id, name, date, percentage, label });

  useEffect(() => {
    if (createdAt && clientDuo && duoDate && resolveDate) {
      const currentDate = new Date();
      const createdAtPercentage = calculateElapsedTime(createdAt, clientDuo);
      const clientDuoPercentage = calculateElapsedTime(createdAt, clientDuo);
      const duoDatePercentage = calculateElapsedTime(createdAt, duoDate);
      const currentDatePercentage = calculateElapsedTime(currentDate, duoDate);
      const resolveDatePercentage = calculateElapsedTime(
        createdAt,
        resolveDate,
      );

      const createdat = dataEntry(
        1,
        "createdAt",
        createdAt,
        createdAtPercentage,
        "Datum prijave",
      );
      const clientDuoDataEntry = dataEntry(
        2,
        "clientDuo",
        clientDuo,
        clientDuoPercentage,
        "Želja klijenta",
      );
      const duoDateDataEntry = dataEntry(
        3,
        "duoDate",
        duoDate,
        duoDatePercentage,
        "Predviđeni datum završetka",
      );
      const resolveDateDataEntry = dataEntry(
        4,
        "resolvedDate",
        resolveDate,
        resolveDatePercentage,
        "Datum završetka",
      );
      const currentDateDataEntry = dataEntry(
        5,
        "currentDate",
        currentDate,
        currentDatePercentage,
        "Trenutni datum",
      );
      const dataList = [
        createdat,
        clientDuoDataEntry,
        duoDateDataEntry,
        resolveDateDataEntry,
        currentDateDataEntry,
      ];
      const sortedDataList = [...dataList]
        .filter((item) => item.percentage > 0)
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
      setSortedDataList(sortedDataList);
    }
  }, [createdAt, clientDuo, duoDate, resolveDate]);

  const calculateElapsedTime = (start: Date, end: Date) => {
    const timeDifference = start.getTime() - end.getTime();
    const totalDuration = 24 * 60 * 60 * 1000;
    const calculate = ((totalDuration - timeDifference) / totalDuration) * 10;
    return calculate;
  };

  return (
    <ol className="w-full justify-between sm:flex">
      {sortedDataList.map((item, index) => {
        const isLastItem = index === sortedDataList.length - 1;

        if (item.percentage > 0) {
          if (
            item.id !== 5 ||
            !sortedDataList.some((entry) => entry.id === 4)
          ) {
            return (
              <li
                className={`relative mb-6 hidden w-full sm:mb-0 lg:inline`}
                key={item.id}
              >
                <div className="flex items-center">
                  <div className="z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 ring-0 ring-white dark:bg-blue-900 dark:ring-gray-900 sm:ring-8">
                    <Tooltip
                      showArrow
                      content={
                        <>
                          <span>{item.label}</span>
                          <p>
                            {Moment(item.date).format("DD.MM.YYYY - HH:mm")}
                          </p>
                        </>
                      }
                    >
                      <svg
                        className="h-2.5 w-2.5 text-blue-800 dark:text-blue-300"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                      </svg>
                    </Tooltip>
                  </div>
                  <div className="h-0.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className={`h-0.5 bg-blue-600`}
                      style={{ width: `${item.percentage}%` }}
                      rounded-full
                    ></div>
                  </div>
                  {!isLastItem && (
                    <div className="hidden h-0.5 w-full bg-gray-200 dark:bg-gray-700 sm:flex">
                      {" "}
                    </div>
                  )}
                </div>
                <span className="top-3 flex justify-center text-tiny">
                  {item.date.toLocaleDateString()}
                </span>
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
