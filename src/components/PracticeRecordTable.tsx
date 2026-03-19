import { useNavigate } from "react-router-dom";
import type { PracticeRecord } from "../types";
import { formatTime } from "../utils/formatTime";

type Props = {
  records: PracticeRecord[];
};

export default function PracticeRecordTable({ records }: Props) {
  const navigate = useNavigate();

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
          <tr
            key={record.id}
            onClick={() => navigate(`/records/${record.id}`)}
            className="cursor-pointer transition-colors hover:bg-gray-100"
          >
            <td>{record.date}</td>
            <td>{record.distance}</td>
            <td>{formatTime(Number(record.time))}</td>
            <td>{record.stroke}</td>
            <td>{record.facility}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
