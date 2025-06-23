import React, { Fragment } from "react";

import Hero from "../components/Hero";
import Content from "../components/Content";
import ApiTester from "../components/ApiTester";

const Home = () => (
  <Fragment>
    <Hero />
    <hr />
    <Content />
    <hr />
    <ApiTester />
  </Fragment>
);

export default Home;