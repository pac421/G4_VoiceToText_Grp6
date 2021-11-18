import React from "react";
import Core from './core';

class index extends React.Component {
  render() {
    return (
      <div id="content">
        <div className="clearfix">
          <div className="classicTxt-wrapper container">
            <h2>Elaboration PNR par reconnaissance vocale</h2>
            <p>Appuyez sur le micro, puis parlez.</p>
            <div className="row g-4 py-5 row-cols-1 row-cols-lg-3">
              <div className="col-md-4">
                <Core />
                <button 
					type="button" 
					//~ onClick="runSpeechRecognition()"
				>
                  <i className="fa fa-microphone fa-4x" />
                </button>
                <span
                  id="action"
                  style={{
                    marginLeft: "110px"
                  }}
                />
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
                          height: "144px"
                        }}
                        defaultValue={""}
                      />
                    </div>
                    <div className="float-end mt-2 pt-1">
                      <button
                        //~ onclick="myFunction()"
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                      >
                        Valider
                      </button>
                    </div>
                  </form>
                </section>
              </div>
              <div
                className="col-md-4"
                style={{
                  marginTop: "0px"
                }}
              >
                <div className="border rounded-3 legende ">
                  <h4>Mots clés non reconnus</h4>
                  <p>
                    <button className="buttonlegend">
                      <b>Demi-pension</b>
                    </button>
                    <br />
                    <button className="buttonlegend">
                      <b>Petit-déjeuner</b>
                    </button>
                    <br />
                    <button className="buttonlegend">
                      <b>Hébergements seuls</b>
                    </button>
                    <br />
                    <button className="buttonlegend">
                      <b>Pension complète</b>
                    </button>
                    <br />
                    <button className="buttonlegend">
                      <b>Tout inclus</b>
                    </button>
                    <br />
                    <button className="buttonlegend">
                      <b>All inclusive</b>
                    </button>
                    <br />
                    <button className="buttonlegend">
                      <b>Conditions d’annulation</b>
                    </button>
                    <br />
                    <button className="buttonlegend">
                      <b>Contre-proposition</b>
                    </button>
                    <br />
                    <button className="buttonlegend">
                      <b>12 juillet 2022</b>
                    </button>
                    <br />
                    <button className="buttonlegend">
                      <b>? Nuit(s)</b>
                    </button>
                    <br />
                    <button className="buttonlegend">
                      <b>Martinique</b>
                    </button>
                    <br />
                    <button className="buttonlegend">
                      <b>Marseille</b>
                    </button>
                    <br />
                    <button className="buttonlegend">
                      <b>? Adulte(s), ? enfant(s) et ? bébé(s)</b>
                    </button>
                    <br />
                  </p>
                </div>
              </div>
            </div>
            <h2>Statistiques d’utilisations</h2>
            <div className="d-flex justify-content-center">
              <div className="wrapper container bg-light shadow-sm">
                <div className="container textbody">
                  <h2> Nombre de mots-clés : </h2>
                  <div className="row text-center text-white">
                    <div className="col-4 colorone arondir mt-3 shadow-sm p-3 mb-4">
                      <h2>00</h2>
                      <p className="texte">détectés par minute</p>
                    </div>
                    <div className="col-4 colortwo arondir mt-3 shadow-sm p-3 mb-4">
                      <h2>00</h2>
                      <p className="texte">détectés par heure</p>
                    </div>
                    <div className="col-4 colorone arondir mt-3 shadow-sm p-3 mb-4">
                      <h2>00</h2>
                      <p className="texte">détectés par jour</p>
                    </div>
                  </div>
                </div>
                <div className="container textbody case">
                  <h2> Statistiques </h2>
                  <div className="row text-white text-center">
                    <div className="col colorone arondir mt-3 shadow-sm p-3 mb-4">
                      <h2> 77%</h2>
                      <p className="texte"> de réussite de détection</p>
                      <div className="progress mb-2">
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{
                            width: "77%"
                          }}
                          aria-valuenow={77}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="container textbody casebisbis">
                  <div className="row text-white text-center">
                    <div className="col-6 colorone arondir mt-3 shadow-sm p-3 mb-4 ">
                      <h2> 00</h2>
                      <p className="texte"> conversations en cours </p>
                    </div>
                    <div className="col-6 colortwo arondir mt-3 shadow-sm p-3 mb-4">
                      <h2> 00 </h2>
                      <p className="texte"> actions exécutées </p>
                    </div>
                  </div>
                </div>
                <div className="container textbody case">
                  <h2> Performances </h2>
                  <div className="row text-white text-center">
                    <div className="col-6 colortwo arondir mt-3 shadow-sm p-3 mb-5">
                      <h2> 50 %</h2>
                      <p className="texte"> de CPU utilisé par la Raspberry </p>
                      <div className="progress mb-2">
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
                    <div className="col-6 colorone arondir mt-3 shadow p-3 mb-5">
                      <h2> 75 %</h2>
                      <p className="texte"> de RAM utilisé par la Raspberry</p>
                      <div className="progress mb-2">
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{
                            width: "75%"
                          }}
                          aria-valuenow={90}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default index;
