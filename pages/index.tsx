import { nanoid } from "nanoid";
import Head from "next/head";
import Router from "next/router";
import { useState } from "react";
import {
  Button,
  Col,
  Container,
  Form,
  Jumbotron,
  Row,
  Spinner,
} from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import Layout from "../src/components/Layout";
import SamayRBC from "../src/components/SamayRBC";
import { encrypt } from "../src/helpers";
import toastOptions from "../src/helpers/toastOptions";
import { Poll, Time } from "../src/models/poll";
import { createPoll } from "../src/utils/api/server";

const Home = (): JSX.Element => {
  const [pollDetails, setPollDetails] = useState<{
    pollTitle: string;
    pollLocation: string;
    pollDescription: string;
  }>({
    pollTitle: "",
    pollLocation: "",
    pollDescription: "",
  });

  const [pollType, setPollType] = useState("group");

  const { pollTitle, pollLocation, pollDescription } = pollDetails;

  const [pollTimes, setTimes] = useState<Time[]>([]);
  const [disabled, setDisabled] = useState<boolean>(false);

  const handlePollDetailsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { name, value } = e.target;

    setPollDetails({
      ...pollDetails,
      [name]: value,
    });
  };

  const handlePollTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    setPollType(e.target.value);
  };

  const handleSubmit = async (
    e: React.MouseEvent<HTMLInputElement>
  ): Promise<void> => {
    e.preventDefault();

    console.log('🛠️ DEBUG: Starting poll creation...');
    console.log('🧪 NEXTAUTH_SECRET (client):', process.env.NEXT_PUBLIC_NEXTAUTH_SECRET || '(not available)');


    if (!pollTimes || (pollTimes && pollTimes?.length < 2)) {
      toast.error("Please select at least two time slots", toastOptions);
      return;
    }

    const secret = nanoid(10);
    const encryptedSecret = encrypt(secret);

    const poll: Poll = {
      title: pollTitle,
      description: pollDescription,
      location: pollLocation,
      type: pollType,
      secret: encryptedSecret,
      times: pollTimes,
    };

    try {
      setDisabled(true);

      const createPollResponse = await createPoll({
        poll,
      });

      if (createPollResponse.statusCode === 201) {
        if (typeof window !== "undefined") {
          const samayCreatedPolls = localStorage.getItem("samayCreatedPolls");

          if (!samayCreatedPolls) {
            const initSamayCreatedPolls = {
              polls: [
                {
                  [`${createPollResponse.data._id}-${pollTitle}`]: `${encryptedSecret}`,
                },
              ],
            };

            localStorage.setItem(
              "samayCreatedPolls",
              JSON.stringify(initSamayCreatedPolls)
            );
          } else {
            let samayCreatedPollsJSON = JSON.parse(samayCreatedPolls);

            samayCreatedPollsJSON.polls.push({
              [`${createPollResponse.data._id}-${pollTitle}`]: `${encryptedSecret}`,
            });

            localStorage.setItem(
              "samayCreatedPolls",
              JSON.stringify(samayCreatedPollsJSON)
            );
          }
        }
        Router.push(`/poll/${createPollResponse.data._id}/${secret}`);
      } else {
        setDisabled(false);
        toast.error(
          "Poll creation failed, please try again later",
          toastOptions
        );
      }
    } catch (err) {
      setDisabled(false);
      toast.error("Poll creation failed, please try again later", toastOptions);
    }
  };

  return (
    <>
      <Head>
        <title>Samay — find a time which works for everyone</title>
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="title"
          content="Samay — find a time which works for everyone"
        />
        <meta
          name="description"
          content="Free and open source group scheduling tool. Quickly find a time which works for everyone without the back-and-forth texts/emails!"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://samay.app" />
        <meta
          property="og:title"
          content="Samay — find a time which works for everyone"
        />
        <meta
          property="og:description"
          content="Free and open source group scheduling tool. Quickly find a time which works for everyone without the back-and-forth texts/emails!"
        />
        <meta property="og:image" content="https://samay.app/banner.png" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://samay.app" />
        <meta
          property="twitter:title"
          content="Samay — find a time which works for everyone"
        />
        <meta
          property="twitter:description"
          content="Free and open source group scheduling tool. Quickly find a time which works for everyone without the back-and-forth texts/emails!"
        />
        <meta property="twitter:image" content="https://samay.app/banner.png" />
      </Head>
      <Layout>
        <div className="global-page-section">
          <Container className="global-container">
            <Jumbotron className="new-poll-timeslot-jumbo">
              <SamayRBC pollTimes={pollTimes} setTimes={setTimes} />
            </Jumbotron>
            <Jumbotron className="new-poll-jumbo">
              <Row>
                <Col sm className="samay-form-col">
                  <Form.Control
                    className="form-text"
                    type="text"
                    maxLength={30}
                    placeholder="Title"
                    name="pollTitle"
                    onChange={handlePollDetailsChange}
                  />
                </Col>
                <Col sm className="samay-form-col">
                  <Form.Control
                    className="form-text"
                    type="text"
                    name="pollDescription"
                    maxLength={50}
                    placeholder="Description"
                    onChange={handlePollDetailsChange}
                  />
                </Col>
                <Col sm className="samay-form-col">
                  <Form.Control
                    className="form-text"
                    type="text"
                    name="pollLocation"
                    maxLength={40}
                    placeholder="Location"
                    onChange={handlePollDetailsChange}
                  />
                </Col>
                <Col sm className="samay-form-col">
                  <Form.Group className="form-group">
                    <Form.Control
                      as="select"
                      className="form-select"
                      name="pollType"
                      defaultValue="group"
                      onChange={handlePollTypeChange}
                    >
                      <option value="group">Group poll</option>
                      <option value="oneonone">One-on-one poll</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col sm="auto">
                  <Button
                    className="global-primary-button"
                    onClick={handleSubmit}
                    disabled={disabled}
                  >
                    {!disabled ? (
                      `Create`
                    ) : (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="form-button-spinner"
                        />
                      </>
                    )}
                  </Button>
                </Col>
              </Row>
            </Jumbotron>
            <ToastContainer />
          </Container>
        </div>
      </Layout>
    </>
  );
};

export default Home;
