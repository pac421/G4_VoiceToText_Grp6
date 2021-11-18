import React from "react";
import Core from './core';

import minutes from '../assets/img/minutes.png';

import 'bootstrap/dist/css/bootstrap.css';
require('../assets/styles.css');

class index extends React.Component {
  render() {
    return (
      <div id="content">
        <div className="clearfix">
          <div
            className="classicTxt-wrapper container"
            style={{
              backgroundColor: "#0082AE",
              paddingTop: "20px"
            }}
          />
          <div className="classicTxt-wrapper container">
            <h2>Elaboration PNR par reconnaissance vocale</h2>
            <div className="row g-4">
              <div className="col-md-6">
                <Core/>
                <button
                  type="button"
                  style={{
                    marginLeft: "288px",
                    marginTop: "125px"
                  }}
                >
                  <i className=" fa fa-microphone fa-3x" />
                </button>
                <p
                  style={{
                    textAlign: "center"
                  }}
                >
                  Appuyer sur le micro, puis parler.
                </p>
                <span id="action" />
              </div>
              <div
                className="col-md-4"
                style={{
                  marginTop: "55px"
                }}
              >
                <section className="align-self-center">
                  <form
                    style={{
                      width: "26rem"
                    }}
                  >
                    <div className="form-outline mb-4">
                      <textarea
                        cols={50}
                        id="output"
                        style={{
                          marginTop: "0px",
                          marginBottom: "0px",
                          height: "300px",
                          width: "360px"
                        }}
                        defaultValue={""}
                      />
                    </div>
                  </form>
                </section>
              </div>
            </div>
            <div className="row border rounded-3 legende">
              <div
                className="col-md-6"
                style={{
                  marginTop: "0px"
                }}
              >
                <h4>Mots clés non reconnus</h4>
                <p>
                  <button className="buttonlegend">
                    <b>Demi-pension</b>
                  </button>
                  <button className="buttonlegend">
                    <b>Petit-déjeuner</b>
                  </button>
                  <button className="buttonlegend">
                    <b>Hébergements seuls</b>
                  </button>
                </p>
              </div>
              <div
                className="col-md-6"
                style={{
                  marginTop: "38px"
                }}
              >
                <p>
                  <button className="buttonlegend">
                    <b>Pension complète</b>
                  </button>
                  <button className="buttonlegend">
                    <b>Tout inclus</b>
                  </button>
                  <button className="buttonlegend">
                    <b>All inclusive</b>
                  </button>
                </p>
              </div>
            </div>
            <div
              style={{
                textAlign: "center"
              }}
            >
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm js-scrollTo"
                href="#page-1"
                style={{
                  marginLeft: "10px",
                  marginTop: "10px"
                }}
              >
                <a className="js-scrollTo" href="#page-1" />
                Accès aux statistiques
              </button>
            </div>
          </div>
          <div
            className="classicTxt-wrapper container"
            style={{
              paddingRight: "0px",
              paddingLeft: "0px"
            }}
            id="page-1"
          >
            <div className="destination">
              <div
                className="colonne border rounded-3"
                style={{
                  paddingBottom: "4px"
                }}
              >
                <img
                  src={minutes}
                  style={{
                    width: "27%"
                  }}
                  alt="Graphique"
                />
                <p className="paragraphe-dest">
                  <span
                    style={{
                      fontSize: "35px"
                    }}
                  >
                    300{" "}
                  </span>
                  mots clés détectés par minute
                </p>
              </div>
              <div
                className="colonne border rounded-3"
                style={{
                  marginLeft: "10px",
                  marginRight: "10px"
                }}
              >
                <i
                  className="far fa-chart-bar fa-4x"
                  style={{
                    color: "#f49b00",
                    marginTop: "31px"
                  }}
                />
                <p
                  className="paragraphe-dest"
                  style={{
                    marginTop: "22px"
                  }}
                >
                  <span
                    style={{
                      fontSize: "35px"
                    }}
                  >
                    6 000
                  </span>
                  mots clés détectés par heure
                </p>
              </div>
              <div className="colonne border rounded-3">
                <i
                  className="far fa-calendar-alt fa-4x"
                  style={{
                    color: "#f49b00",
                    marginTop: "31px"
                  }}
                />
                <p
                  className="paragraphe-dest"
                  style={{
                    marginTop: "22px"
                  }}
                >
                  <span
                    style={{
                      fontSize: "35px"
                    }}
                  >
                    40 000
                  </span>
                  mots clés détectés par jour
                </p>
              </div>
              <div className="row text-white text-center">
                <div className="col-2" />
                <div
                  className="col-6 mt-3 colonne border rounded-3"
                  style={{
                    marginRight: "10px",
                    marginBottom: "10px"
                  }}
                >
                  <i
                    className="fas fa-user-tie fa-4x"
                    style={{
                      color: "#f49b00"
                    }}
                  />
                  <p
                    className="paragraphe-dest"
                    style={{
                      marginTop: "22px"
                    }}
                  >
                    <span
                      style={{
                        fontSize: "35px"
                      }}
                    >
                      12
                    </span>
                    conversation en cours
                  </p>
                </div>
                <div
                  className="col-6 mt-3 colonne border rounded-3"
                  style={{
                    marginBottom: "10px"
                  }}
                >
                  <i
                    className="fas fa-paper-plane fa-4x"
                    style={{
                      color: "#f49b00"
                    }}
                  />
                  <p
                    className="paragraphe-dest"
                    style={{
                      marginTop: "22px"
                    }}
                  >
                    <span
                      style={{
                        fontSize: "35px"
                      }}
                    >
                      30
                    </span>
                    actions exécutées
                  </p>
                </div>
                <div
                  className="colonne border rounded-3"
                  style={{
                    paddingBottom: "50px",
                    marginLeft: "470px",
                    marginBottom: "10px"
                  }}
                >
                  <p
                    className="paragraphe-dest"
                    style={{
                      marginTop: "22px"
                    }}
                  >
                    Taux de réussite de détection des mots clés
                  </p>
                  <span
                    style={{
                      fontSize: "35px",
                      color: "black",
                      fontWeight: "bold"
                    }}
                  >
                    90%
                  </span>
                  <div
                    className="progress mb-2"
                    style={{
                      marginRight: "50px",
                      marginLeft: "50px",
                      border: "solid #f49b00"
                    }}
                  >
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{
                        width: "90%"
                      }}
                      aria-valuenow={90}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>
              </div>
              <div
                className="colonne border rounded-3"
                style={{
                  paddingBottom: "50px"
                }}
              >
                <p
                  className="paragraphe-dest"
                  style={{
                    marginTop: "22px"
                  }}
                >
                  Taux d'utilisation du CPU de la Raspberry{" "}
                </p>
                <span
                  style={{
                    fontSize: "35px",
                    color: "black",
                    fontWeight: "bold"
                  }}
                >
                  50%
                </span>
                <div
                  className="progress mb-2"
                  style={{
                    marginRight: "50px",
                    marginLeft: "50px",
                    border: "solid #f49b00"
                  }}
                >
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{
                      width: "50%"
                    }}
                    aria-valuenow={90}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>
              <div
                className="colonne border rounded-3"
                style={{
                  paddingBottom: "50px",
                  marginBottom: "20px",
                  marginLeft: "10px"
                }}
              >
                <p
                  className="paragraphe-dest"
                  style={{
                    marginTop: "22px"
                  }}
                >
                  Taux d'utilisation de la RAM de la Raspberry
                </p>
                <span
                  style={{
                    fontSize: "35px",
                    color: "black",
                    fontWeight: "bold"
                  }}
                >
                  75%
                </span>
                <div
                  className="progress mb-2"
                  style={{
                    marginRight: "50px",
                    marginLeft: "50px",
                    border: "solid #f49b00"
                  }}
                >
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{
                      width: "90%"
                    }}
                    aria-valuenow={90}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>
            </div>
            <div
              className="destination"
              style={{
                backgroundColor: "#0082AE",
                paddingTop: "50px"
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default index;
