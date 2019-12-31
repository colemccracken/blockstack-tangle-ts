import React, { useCallback } from "react";
import { RouteComponentProps, withRouter } from "react-router";

import { useDropzone } from "react-dropzone";
import { createCapture, createCaptures } from "../../data/store/store";
import { UserSession, makeUUID4 } from "blockstack";
import { Capture } from "../../data/models/capture";

interface RouteProps extends RouteComponentProps<{}> {}

interface Props extends RouteProps {
  userSession: UserSession;
}

function MyDropzone(props: Props) {
  const onDrop = useCallback(acceptedFiles => {
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
              createdAt: Date.now()
            } as Capture;
            captures.push(capture);
          }
        });
        await createCaptures(props.userSession, captures);
        console.log("DONE");
      };
      reader.readAsBinaryString(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <p>Drag 'n' drop some files here, or click to select files</p>
      )}
    </div>
  );
}

export default withRouter(MyDropzone);
