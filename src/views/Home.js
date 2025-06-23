import React, { Fragment } from "react";
import { useAuth0 } from "@auth0/auth0-react";

import Hero from "../components/Hero";
import Content from "../components/Content";
import ApiTester from "../components/ApiTester";

const Home = () => {
  const { isAuthenticated } = useAuth0();
  
  return (
    <Fragment>
      <Hero />
      <hr />
      <Content />
      <hr />
      <div className="container">
        <div className="row">
          <div className="col-12">
            <ApiTester />
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Home;
