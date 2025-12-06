import { VscLoading } from "react-icons/vsc";
import style from "./Loading.module.css";

export default function Loading() {
  return <VscLoading className={`w-full h-full ${style.loading}`} />;
}
