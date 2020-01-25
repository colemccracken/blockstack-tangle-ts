import React, { useCallback } from "react";
import { RouteComponentProps, withRouter } from "react-router";

import { useDropzone } from "react-dropzone";
import { createCaptures, SyncCaptures } from "../../data/store/store";
import { UserSession, makeUUID4 } from "blockstack";
import { Capture } from "../../data/models/capture";

interface RouteProps extends RouteComponentProps<{}> {}

interface Props extends RouteProps {
  userSession: UserSession;
  refreshData: (userSession: UserSession) => Promise<any>;
}

function MyDropzone(props: Props) {
  const onDrop = useCallback(acceptedFiles => {
    let count = acceptedFiles.length;
    acceptedFiles.forEach(file => {
      const reader = new FileReader();

      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = async () => {
        // Do whatever you want with the file contents
        const binaryStr = reader.result as string;
        const blocks = binaryStr.split("\n");
        const captures: Capture[] = [];
        blocks.forEach(block => {
          if (/\S/.test(block)) {
            const capture = {
              id: makeUUID4(),
              text: block.trim(),
              createdAt: Date.now(),
              owner: true
            } as Capture;
            captures.push(capture);
          }
        });
        createCaptures(captures);
        count--;
        if (count === 0) {
          await SyncCaptures(props.userSession);
          props.refreshData(props.userSession);
        }
      };
      reader.readAsBinaryString(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <p>Drag some files here, or click to select files</p>
    </div>
  );
}

export default withRouter(MyDropzone);
