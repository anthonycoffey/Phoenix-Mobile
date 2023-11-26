import React, { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import api, { responseDebug } from "@/utils/api";
import JobsList from "@/components/JobsList";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSession } from "@/ctx";
import { AxiosResponse, AxiosError } from "@/types";

SplashScreen.preventAutoHideAsync();

type options = {} | null;
type page = number | null;
type sort = string | null;

export default function Index() {
  const { signOut } = useSession();
  const [jobs, setJobs] = useState<[] | null>(null);
  const [page, setPage] = useState<page | null>(1);
  const [sort, setSort] = useState<sort | null>("-createdAt");
  const [scope, setScope] = useState<"active" | "">("active");

  const fetchJobs = () => {
    console.log({ sort, page, scope });
    if (scope === "active") setSort("-arrivalTime");

    // returning a promise here so that we can use .finally() within <JobsList> component
    return api
      .get(`/jobs/mine?sortBy=${sort}&page=${page}&scope=${scope}`)
      .then(function (response: AxiosResponse) {
        const { data, meta } = response.data; // todo: meta is returned here but not used currently
        setJobs(data);
      });
  };

  useEffect(() => {
    fetchJobs().catch(async function (error: AxiosError) {
      if (error.response.status === 401) {
        // todo: update to work with new auth token storage, this is old
        await AsyncStorage.removeItem("token");
        router.push("/");
      }
      responseDebug(error);
    });
  }, []);

  return <JobsList jobs={jobs} fetchJobs={fetchJobs} />;
}
