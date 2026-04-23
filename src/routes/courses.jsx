import { useEffect } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";

export const Route = {
  path: "/courses",
  fullPath: "/courses",
  useParams: () => useParams(),
  useSearch: () => {
    const _loc = useLocation();
    const _sp = new URLSearchParams(_loc.search);
    const _o = {};
    _sp.forEach((v, k) => { _o[k] = v; });
    return _o;
  },
};

export default function _Page() {  return <CoursesLayout />;
}


function CoursesLayout() {
  return <Outlet />;
}