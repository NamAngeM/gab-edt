import TimetablePage from '@/app/admin/timetable/page';

export default function TvDisplayWrapper({ searchParams }: any) {
  // Render the timetable grid directly, but force TV mode to hide the sidebar and toolbar
  return <TimetablePage searchParams={{ ...searchParams, tv: 'true' }} />;
}
