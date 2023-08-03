import React, { Component } from "react";
import ControlPanel from "./components/ControlPanel";
import WorkSpace from "./components/WorkSpace";

export default () => {  
  return (
    <div className="App">
      <div className="left-panel prose">
        <h5>Панель инструментов</h5>

        <ControlPanel />
      </div>

      <div className="right-panel">
        <WorkSpace />
      </div>
   
    </div>
  );
};

