import type { PracticeRecordWithFacility } from "../types";
import { formatTime } from "../utils/formatTime";

type Props = {
  records: PracticeRecordWithFacility[];
};

export default function PracticeRecordTable({ records }: Props) {
  return (
    <table>
      <thead>
        <tr>
          <th>日付</th>
          <th>距離 (m)</th>
          <th>タイム</th>
          <th>泳法</th>
          <th>プール施設</th>
        </tr>
      </thead>
      <tbody>
        {records.map((record) => (
          <tr key={record.id}>
            <td>{record.date}</td>
            <td>{record.distance}</td>
            <td>{formatTime(Number(record.time))}</td>
            <td>{record.stroke}</td>
            <td>{record.facilities.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
