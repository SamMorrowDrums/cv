import { parseISO, format } from "date-fns";

export default function DateFormatter({ dateString }) {
  if (!dateString) {
    return "Present";
  }
  const date = parseISO(dateString);
  return <time dateTime={dateString}>{format(date, "LLLL yyyy")}</time>;
}
