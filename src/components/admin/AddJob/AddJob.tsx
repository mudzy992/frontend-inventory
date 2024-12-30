import React, { useEffect, useState } from "react";
import { ApiResponse, useApi } from "../../../API/api";
import {
  Button,
  Input,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "@nextui-org/react";
import Toast from "../../custom/Toast";
interface JobType {
  jobId: number;
  title: string;
  description: string;
  jobCode: string;
}

interface AddJobState {
  message: {
    message: string;
    variant: string;
  };
  jobBase: JobType[];
  isLoggedIn: boolean;
  add: {
    job: {
      title: string;
      description: string;
      jobCode: string;
    };
  };
}

const AddJob: React.FC = () => {
  const { api } = useApi();
  const [state, setState] = useState<AddJobState>({
    message: {message: "", variant: ""},
    isLoggedIn: true,
    jobBase: [],
    add: {
      job: {
        title: "",
        description: "",
        jobCode: "",
      },
    },
  });

  useEffect(() => {
    getJobs();
  }, []);

  /* SET */
  const setAddNewJobStringState = (fieldName: string, newValue: string) => {
    setState((prevState) => ({
      ...prevState,
      add: {
        ...prevState.add,
        job: {
          ...prevState.add.job,
          [fieldName]: newValue,
        },
      },
    }));
  };

  const setErrorMessage = (message: string, variant: string) => {
    setState((prev) => ({
      ...prev,
      message: { message, variant },
    }));
  };

  const setLoggedInStatus = (isLoggedIn: boolean) => {
    setState((prev) => ({ ...prev, isLoggedIn: isLoggedIn }));
  };

  const setJobData = (jobData: JobType[]) => {
    setState(
      Object.assign(state, {
        jobBase: jobData,
      }),
    );
  };

  /* GET */

  const getJobs = () => {
    api("api/job?sort=title,ASC", "get", {}, "administrator").then(
      (res: ApiResponse) => {
        if (res.status === "login") {
          setLoggedInStatus(false);
          return;
        }
        if (res.status === "error") {
          setErrorMessage(
            "Greška prilikom učitavanja radnih mjesta.",
            "danger",
          );
          return;
        }
        setJobData(res.data);
      },
    );
  };

  const doAddJob = () => {
    api("api/job/", "post", state.add.job, "administrator").then(
      (res: ApiResponse) => {
        if (res.status === "login") {
          setLoggedInStatus(false);
          return;
        }
        if (res.status === "error") {
          setErrorMessage("Greška prilikom dodavanja radnog mjesta.", "danger");
          return;
        }
        setErrorMessage("Uspješno dodano radno mjesto", "success");
        getJobs();
      },
    );
  };

  const addForm = () => {
    return (
      <ModalContent>
        <ModalHeader>Detalji radnog mjesta</ModalHeader>
        <ModalBody>
          <div className="flex flex-col">
            <div className="mb-3 mr-3 w-full">
              <Input
                id="jobTitle"
                type="text"
                label="Naziv radnog mjesta"
                labelPlacement="inside"
                value={state.add.job.title}
                onChange={(e) => {
                  setAddNewJobStringState("title", e.target.value);
                }}
              ></Input>
            </div>
            <div className="mb-3 mr-3 w-full">
              <Textarea
                id="jobDescription"
                label="Opis"
                placeholder="Opišite radno mjesto"
                value={state.add.job.description}
                onChange={(e) =>
                  setAddNewJobStringState("description", e.target.value)
                }
              />
            </div>
            <div className="w-full lg:flex">
              <Input
                id="jobCode"
                type="text"
                label="Šifra radnog mjesta"
                labelPlacement="inside"
                value={state.add.job.jobCode}
                onChange={(e) =>
                  setAddNewJobStringState("jobCode", e.target.value)
                }
              ></Input>
            </div>
          </div>
          <ModalFooter className={state.add.job.title ? "" : "hidden"}>
            <div style={{ alignItems: "end" }}>
              <Button onClick={() => doAddJob()} color="success">
                <i className="bi bi-plus-circle" />
                Dodaj radno mjesto
              </Button>
            </div>
          </ModalFooter>
        </ModalBody>
      </ModalContent>
    );
  };
  return (
    <div>
      <div>
        {addForm()}
        <Toast
          variant={state.message?.variant}
          message={state.message?.message}
        />
      </div>
    </div>
  );
};
export default AddJob;
