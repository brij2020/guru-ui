"";
import React from "react";
import Cards from "./userdashboarComponent/Cards";
import Charts from "./userdashboarComponent/Charts";
import OngoingCourses from "./userdashboarComponent/OngoingCourse";
import RecommendedCourses from "./userdashboarComponent/RecomendedCourse";
import RecentActivity from "./userdashboarComponent/ReacentActivity";
import UpcomingTests from "./userdashboarComponent/UpcomingTests";
import LearningProgress from "./userdashboarComponent/LearningProcess";
import QuickActions from "./userdashboarComponent/QuickAction";
interface Props {
  dict: any;
  lang:any;
}

const UserDashboardClient = ({dict,lang}:Props) => {
  return (
    <div
      className="space-y-2 p-2"
      style={{
        background: "var(--content-bg)",
        color: "var(--section-text)",
      }}
    >
      <div className="grid grid-cols-1 gap-4">
        {/* <DashboardCards dict={dict} lang={lang} /> */}
        <Cards dict={dict} lang={lang} />
      </div>
      <div className="grid grid-cols-1 gap-4">
        <Charts dict={dict} lang={lang}/>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <OngoingCourses dict={dict} lang={lang}/>
         <RecommendedCourses dict={dict} lang={lang}/>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
      <RecentActivity  dict={dict} lang={lang}/>
      <UpcomingTests dict={dict} lang={lang}/>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
       <LearningProgress dict={dict} lang={lang}/>
       <QuickActions dict={dict} lang={lang}/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
      </div>
    </div>
  );
}

export default UserDashboardClient;