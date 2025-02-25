import React, { useContext } from "react";
import { AppContext } from "../../App";
import { Form, Row, Col, Card, Table, Button } from "react-bootstrap";

import NDGBanner from "../NDGBanner";
import { colors } from "../../config/colors";

export default function CustomerInfoCard({ findContract, setFindContract }) {
  const { manageAppContext } = useContext(AppContext);

  const setSpinner = manageAppContext.setSpinner;
  const pageData = manageAppContext.pageData;
  const admin = manageAppContext.accessToken.role;
  const page = manageAppContext.page === "broadband-orders";

  let data = pageData.filter((contract) => contract._id === findContract)[0];
  console.log(data);

  const broadbandData = data.oneTouchBroadband;
  const customerData = data.oneTouchCustomer;

  let bgColor = "";
  const contractStartDay = broadbandData.contractStartDay;
  let contractEndDay;

  // contract expiration day
  const today = new Date();
  if (contractStartDay) contractEndDay = new Date(broadbandData.contractEndDay);
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(today.getMonth() + 6);

  if (contractEndDay < today && contractStartDay) {
    bgColor = colors.bgSTOP;
  }
  if (contractEndDay < sixMonthsFromNow && contractEndDay > today) {
    bgColor = colors.bgSET;
  }
  if (contractEndDay > sixMonthsFromNow) {
    bgColor = colors.bgGO;
  }
  if (!contractStartDay) {
    bgColor = colors.bgPENDING;
  }

  async function deleteContract() {
    setSpinner(true);
    const access_token = manageAppContext.accessToken.access_token;
    const URL = "/.netlify/functions/mongoDB";

    try {
      const body = {
        oneTouchPath: "deleteContract",
        access_token,
        id: findContract,
      };
      console.log(body);

      const config = {
        method: "POST",
        body: JSON.stringify(body),
      };
      const response = await fetch(URL, config);
      const data = await response.json();

      if (!response.ok) {
        setSpinner(false);
        manageAppContext.setAlert({ color: "warning", msg: data.msg });
        console.log(data);
        return;
      }

      const updateData = pageData.filter(
        (contract) => contract._id !== findContract
      );

      setSpinner(false);
      setFindContract(false);
      manageAppContext.setPageData(updateData);
      manageAppContext.setAlert({ color: "success", msg: data.msg });
    } catch (err) {
      console.log(err);
    }
  }
  async function activateContract() {
    setSpinner(true);
    const access_token = manageAppContext.accessToken.access_token;
    const URL = "/.netlify/functions/mongoDB";

    const contractStartDay = document.querySelector("#contractStartDay").value;
    const contractEndDay = document.querySelector("#contractEndDay").value;

    if (!contractStartDay || !contractEndDay) {
      setSpinner(false);
      const msg = `Please choose contract start and end days!`;
      manageAppContext.setAlert({ color: "warning", msg });
      return;
    }

    let contract = data;
    contract.oneTouchBroadband.contractStartDay = contractStartDay;
    contract.oneTouchBroadband.contractEndDay = contractEndDay;

    try {
      const body = {
        oneTouchPath: "activateContract",
        access_token,
        id: findContract,
        contract,
      };
      console.log(body);

      const config = {
        method: "POST",
        body: JSON.stringify(body),
      };
      const response = await fetch(URL, config);
      const data = await response.json();

      if (!response.ok) {
        setSpinner(false);
        manageAppContext.setAlert({ color: "warning", msg: data.msg });
        console.log(data);
        return;
      }

      const updateData = pageData.map((listContract) =>
        listContract._id === findContract ? contract : listContract
      );

      setSpinner(false);
      manageAppContext.setPageData(updateData);
      manageAppContext.setAlert({ color: "success", msg: data.msg });
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      <div className="features-align-right">
        <div style={styles.btn}>
          <Button
            onClick={() => setFindContract(false)}
            variant="outline-dark"
            size="sm"
          >
            <span aria-hidden="true">×</span>
          </Button>
        </div>
      </div>

      {admin && page && (
        <div className="features">
          <div className="flex-container-50">
            <Card
              text="dark"
              style={{ background: colors.lightGrey }}
              className="mb-2"
            >
              <Card.Header>
                <div>Activate Contract</div>
              </Card.Header>
              <Card.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Row>
                      <Col>
                        <Form.Label>Contract Start Day</Form.Label>
                        <Form.Control
                          id="contractStartDay"
                          type="date"
                          placeholder="DD/MM/YYYY"
                        />
                      </Col>
                      <Col>
                        <Form.Label>Contract End Day</Form.Label>
                        <Form.Control
                          id="contractEndDay"
                          type="date"
                          placeholder="DD/MM/YYYY"
                        />
                      </Col>
                    </Row>
                    <Row className="mt-3">
                      <Col>
                        <Button
                          onClick={() => activateContract()}
                          variant="outline-success"
                          size="sm"
                        >
                          Activate Contract
                        </Button>
                      </Col>
                    </Row>
                  </Form.Group>
                </Form>
              </Card.Body>
            </Card>
          </div>

          <div className="flex-container-50">
            <Card
              bg="Light"
              text="dark"
              style={{ width: "100%" }}
              className="mb-2"
            >
              <Card.Header>
                <div>Contract Information</div>
              </Card.Header>
              <Card.Body>
                <Table bordered hover size="sm">
                  <tbody>
                    <tr style={{ background: bgColor }}>
                      <td>Contract Start Day</td>
                      <td>{broadbandData.contractStartDay}</td>
                    </tr>
                    <tr style={{ background: bgColor }}>
                      <td>Contract End Day</td>
                      <td>{broadbandData.contractEndDay}</td>
                    </tr>
                    <tr>
                      <td>Contract Price</td>
                      <td>{broadbandData.price}</td>
                    </tr>
                  </tbody>
                </Table>
                <div style={styles.TLS}>
                  <div style={{ background: colors.bgGO }}>EXD {">"} 6</div>
                  <div style={{ background: colors.bgSET }}>EXD {"<"} 6</div>
                  <div style={{ background: colors.bgSTOP }}>Expired</div>
                  <div style={{ background: colors.bgPENDING }}>Pending</div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      )}

      <div className="features">
        <div className="flex-container-50">
          <Card
            bg="Light"
            text="dark"
            style={{ width: "100%" }}
            className="mb-2"
          >
            <Card.Header>
              <div>Company Information</div>
            </Card.Header>
            <Card.Body>
              <Table bordered hover size="sm">
                <tbody>
                  <tr>
                    <td>Company Name</td>
                    <td>{customerData.companyName}</td>
                  </tr>
                  <tr>
                    <td>Product Type</td>
                    <td>{customerData.productType}</td>
                  </tr>
                  <tr>
                    <td>Company Email</td>
                    <td>{customerData.companyEmail}</td>
                  </tr>
                  <tr>
                    <td>Company Phone Number</td>
                    <td>{customerData.companyPhoneNumber}</td>
                  </tr>
                  <tr>
                    <td>Account Manager</td>
                    <td>{customerData.accountManager}</td>
                  </tr>
                  <tr>
                    <td>Company Registration</td>
                    <td>{customerData.companyRegistration}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </div>

        <div className="flex-container-50">
          <Card
            bg="Light"
            text="dark"
            style={{ width: "100%" }}
            className="mb-2"
          >
            <Card.Header>
              <div>Customer Information</div>
            </Card.Header>
            <Card.Body>
              <Table bordered hover size="sm">
                <tbody>
                  <tr>
                    <td>First Name</td>
                    <td>{customerData.fName}</td>
                  </tr>
                  <tr>
                    <td>Last Name</td>
                    <td>{customerData.lName}</td>
                  </tr>
                  <tr>
                    <td>Customer Email</td>
                    <td>{customerData.customerEmail}</td>
                  </tr>
                  <tr>
                    <td>Customer Phone Number</td>
                    <td>{customerData.customerPhoneNumber}</td>
                  </tr>
                  <tr>
                    <td>Notes</td>
                    <td>{customerData.customerNotes}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </div>
      </div>

      <div className="features">
        <div className="flex-container-50">
          <Card
            bg="Light"
            text="dark"
            style={{ width: "100%" }}
            className="mb-2"
          >
            <Card.Header>
              <div>Broadband Information</div>
            </Card.Header>
            <Card.Body>
              <Table bordered hover size="sm">
                <tbody>
                  <tr>
                    <td>Broadband Name</td>
                    <td>{broadbandData.name}</td>
                  </tr>
                  <tr>
                    <td>Broadband Provider</td>
                    <td>{broadbandData.provider}</td>
                  </tr>
                  <tr>
                    <td>Broadband Technology</td>
                    <td>{broadbandData.technology}</td>
                  </tr>
                  <tr>
                    <td>Up Speed</td>
                    <td>{broadbandData.likely_up_speed}</td>
                  </tr>
                  <tr>
                    <td>Down Speed</td>
                    <td>{broadbandData.likely_down_speed}</td>
                  </tr>
                  <tr>
                    <td>Broadband Price</td>
                    <td>{broadbandData.price}</td>
                  </tr>
                  <tr>
                    <td>Broadband Installation Price</td>
                    <td>{broadbandData.installation}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </div>

        <div className="flex-container-50">
          {!page && (
            <Card
              bg="Light"
              text="dark"
              style={{ width: "100%" }}
              className="mb-2"
            >
              <Card.Header>
                <div>Contract Information</div>
              </Card.Header>
              <Card.Body>
                <Table bordered hover size="sm">
                  <tbody>
                    <tr style={{ background: bgColor }}>
                      <td>Contract Start Day</td>
                      <td>{broadbandData.contractStartDay}</td>
                    </tr>
                    <tr style={{ background: bgColor }}>
                      <td>Contract End Day</td>
                      <td>{broadbandData.contractEndDay}</td>
                    </tr>
                    <tr>
                      <td>Contract Price</td>
                      <td>{broadbandData.price}</td>
                    </tr>
                  </tbody>
                </Table>
                <div style={styles.TLS}>
                  <div style={{ background: colors.bgGO }}>EXD {">"} 6</div>
                  <div style={{ background: colors.bgSET }}>EXD {"<"} 6</div>
                  <div style={{ background: colors.bgSTOP }}>Expired</div>
                  <div style={{ background: colors.bgPENDING }}>Pending</div>
                </div>
              </Card.Body>
            </Card>
          )}
        </div>
      </div>

      <div className="features">
        <div className="flex-container-50">
          <Card
            bg="Light"
            text="dark"
            style={{ width: "100%" }}
            className="mb-2"
          >
            <Card.Header>
              <div>Site Installation Details</div>
            </Card.Header>
            <Card.Body>
              <Table bordered hover size="sm">
                <tbody>
                  <tr>
                    <td>Contact Name</td>
                    <td>{customerData.contactFirstName}</td>
                  </tr>
                  <tr>
                    <td>Contact Last Name</td>
                    <td>{customerData.contactLastName}</td>
                  </tr>
                  <tr>
                    <td>Contact Email</td>
                    <td>{customerData.contactEmail}</td>
                  </tr>
                  <tr>
                    <td>Contact Phone Number</td>
                    <td>{customerData.contactPhoneNumber}</td>
                  </tr>
                  <tr>
                    <td>Installation Address</td>
                    <td>
                      <div>
                        {customerData.thoroughfare_number === "null"
                          ? ""
                          : customerData.thoroughfare_number}{" "}
                        {customerData.premises_name === "null"
                          ? ""
                          : customerData.premises_name}{" "}
                        {customerData.sub_premises === "null"
                          ? ""
                          : customerData.sub_premises}{" "}
                        {customerData.thoroughfare_name === "null"
                          ? ""
                          : customerData.thoroughfare_name}{" "}
                        {customerData.county}
                      </div>
                      <div style={styles.bottomRow}>
                        {customerData.postcode}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </div>

        <div className="flex-container-50">
          <Card style={styles.manageCard} className="mb-2">
            <Card.Header>
              <div>Manage Contract</div>
            </Card.Header>
            <Card.Body>
              <Table bordered hover size="sm">
                <tbody>
                  <tr>
                    <td style={styles.cardText}>Delete Contract</td>
                    <td style={styles.btn}>
                      <Button
                        onClick={() => deleteContract()}
                        variant="outline-danger"
                        size="sm"
                      >
                        Delete Contract
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </div>
      </div>
      <div className="features">
        <NDGBanner width="flex-container-30" />
      </div>
    </>
  );
}

const styles = {
  bottomRow: {
    fontSize: "12px",
    color: colors.darkGrey,
  },
  btn: {
    padding: "5px",
  },
  TLS: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
  },
  manageCard: {
    background: colors.bgSTOP,
    color: colors.white,
  },
};
