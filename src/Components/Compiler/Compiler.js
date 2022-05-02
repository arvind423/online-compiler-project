import React, { Component } from "react";
import "./Compiler.css";
import { Buffer } from "buffer";

export default class Compiler extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: sessionStorage.getItem("input") || ``,
      output: ``,
      language_id: localStorage.getItem("language_id") || 2,
      user_input: ``,
    };
  }
  //this deals with the source code the user has typed
  input = (event) => {
    event.preventDefault();
    this.setState({ input: event.target.value });
    localStorage.setItem("input", event.target.value);
  };
  //this deals with the input the user has provided
  userInput = (event) => {
    event.preventDefault();
    this.setState({ user_input: event.target.value });
  };

  //for selecting the language

  language = (event) => {
    event.preventDefault();
    this.setState({ language_id: event.target.value });
    localStorage.setItem("language_id", event.target.value);
  };

  submit = async (e) => {
    e.preventDefault();
    let outputText = document.getElementById("output");
    outputText.innerHTML = "";
    outputText.innerHTML += "Creating Submissions for you.....\n";
    const response = await fetch(
      "https://judge0-ce.p.rapidapi.com/submissions",
      {
        method: "POST",
        headers: {
          "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
          "x-rapidapi-key":
            "f6d6a46e98mshb28052ccec6ec43p1b4d17jsn1dc7cadb613f",
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          source_code: this.state.input,
          stdin: this.state.user_input,
          language_id: this.state.language_id,
        }),
      }
    );
    outputText.innerHTML += "Submission created..\n";
    const jsonResponse = await response.json();
    let jsonGetSolution = {
      status: { description: "Queue" },
      stderr: null,
      compile_output: null,
    };

    while (
      jsonGetSolution.status.description !== "Accepted" &&
      jsonGetSolution.stderr == null &&
      jsonGetSolution.compile_output == null
    ) {
      outputText.innerHTML = `Creating submissions...\n
                Submission Created...\n
                Checking submission status..\n
                status:${jsonGetSolution.status.description}`;

      //getting tokens from the judge0 api
      if (jsonResponse.token) {
        let url = `https://judge0-ce.p.rapidapi.com/submissions
                    /${jsonResponse.token}?base64_encoded=true`;

        //again making the call to the api for the required token
        const getSolution = await fetch(url, {
          method: "GET",
          headers: {
            "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
            "x-rapidapi-key":
              "f6d6a46e98mshb28052ccec6ec43p1b4d17jsn1dc7cadb613f", //insert your api key
            "content-type": "application/json",
          },
        });

        //getting response back from the api
        jsonGetSolution = await getSolution.json();
      } //if block end
    } //while loop end

    if (jsonGetSolution.stdout) {
      //atob is
      const output = Buffer.from(jsonGetSolution.stdout, "base64");
      outputText.innerHTML = "";
      outputText.innerHTML += `Results:\n${output}
            \nExecution Time:${jsonGetSolution.time}secs`;
    } else if (jsonGetSolution.stderr) {
      const error = Buffer.from(jsonGetSolution.stderr, "base64");
      outputText.innerHTML = "";
      outputText.innerHTML += `\n Error:${error}`;
    } else {
      const compilation_err = Buffer.from(jsonGetSolution.compile_output);
      outputText.innerHTML = "";
      outputText.innerHTML += `\n Compilation error:${compilation_err}`;
    }
  }; //end of submit scope
  render() {
    return (
      <>
        <div className="row container-fluid">
          <div className="col-6 ml-4 ">
            <label htmlFor="solution ">
              <span className="badge badge-info heading mt-2 ">
                <i className="fas fa-code fa-fw fa-lg"></i>
                Write Your Code Here
              </span>
            </label>
            <textarea
              required
              name="solution"
              id="source"
              onChange={this.input}
              className=" source"
              value={this.state.input}
            ></textarea>

            <button
              type="submit"
              className="btn btn-danger ml-2 mr-2 "
              onClick={this.submit}
            >
              <i className="fas fa-cog fa-fw"></i>
              Run
            </button>

            <label htmlFor="tags" className="mr-1">
              <b className="heading">Language:</b>
            </label>
            <select
              value={this.state.language_id}
              onChange={this.language}
              id="tags"
              className="form-control form-inline mb-2 language"
            >
              <option value="54">C++</option>
              <option value="50">C</option>
              <option value="62">Java</option>
              <option value="71">Python</option>
            </select>
          </div>
          <div className="col-5">
            <div>
              <span className="badge badge-info heading my-2 ">
                <i className="fas fa-exclamation fa-fw fa-md"></i>
                Output
              </span>
              <textarea id="output"></textarea>
            </div>
          </div>
        </div>

        <div className="mt-2 ml-5">
          <span className="badge badge-primary heading my-2 ">
            <i className="fas fa-user fa-fw fa-md"></i>
            User Input
          </span>
          <br />
          <textarea id="input" onChange={this.userInput}></textarea>
        </div>
      </>
    );
  }
} //end of class scope
