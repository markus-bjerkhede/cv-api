module.exports = ({
  _id,
  consultant,
  presentation,
  managerResume,
  anonymousProfile,
  skills,
  languages,
  hobbies,
  experiences,
  educations,
}) => {
  const profilePic = () => {
    if (process.env.ENVIRONMENT !== "development") {
      if (!anonymousProfile) {
        return `/images/${consultant.profilePic}`;
      } else {
        return "/images/placeholder.PNG";
      }
    } else {
      if (!anonymousProfile) {
        return `http://localhost:5000/images/${consultant.profilePic}`;
      } else {
        return "http://localhost:5000/images/placeholder.PNG";
      }
    }
  };

  const drLogo = () => {
    if (process.env.ENVIRONMENT !== "development") {
      return `/images/dr_logo.png`;
    } else {
      return `http://localhost:5000/images/dr_logo.png`;
    }
  };

  const managerInfo = () => {
    if (managerResume) {
      return '<p style="font-weight: bold; margin-bottom: 0px; padding-bottom: 0px;">Manager contact info</p>';
    } else {
      return "";
    }
  };

  const anonymousName = () => {
    if (!anonymousProfile) {
      return `<h2 style=" margin-bottom: 3px ">
      ${consultant.firstname} ${consultant.lastname}
    </h2>`;
    } else {
      return `<h2 style=" margin-bottom: 3px ">
      Anonymous
    </h2>`;
    }
  };

  const anonymousContactInfo = () => {
    if (
      (!anonymousProfile && managerResume) ||
      (anonymousProfile && managerResume) ||
      (!anonymousProfile && !managerResume)
    ) {
      return `<p style="margin: 2px 0px; padding: 2px 0px;"><span style="font-size: 15px">&#x40;</span> 
      ${consultant.email}
      </p>
      <p style="margin-top: 0px; padding-top: 0px;"><span style="font-size: 15px">&#9742;</span> 
      ${consultant.phone}
      </p>`;
    } else if (anonymousProfile && !managerResume) {
      return `<p style="margin: 2px 0px; padding: 2px 0px;"><span style="font-size: 15px">&#x40;</span> 
      Anonymous
      </p>
      <p style="margin-top: 0px; padding-top: 0px;"><span style="font-size: 15px">&#9742;</span> 
      Anonymous
      </p>`;
    }
  };

  const presentationSetter = () => {
    if (presentation) {
      return presentation;
    } else {
      return consultant.presentation;
    }
  };

  const mappedSkills = skills.map((skill) => {
    const oneStar = "&#9733;";
    const twoStars = "&#9733;&#9733;";
    const threeStars = "&#9733;&#9733;&#9733;";
    const fourStars = "&#9733;&#9733;&#9733;&#9733;";
    const fiveStars = "&#9733;&#9733;&#9733;&#9733;&#9733;";
    if (skill.stars === 1 || skill.stars === "1") {
      return `<p>${skill.name} <span style="color: #FFB400; font-size: 20px">${oneStar}</span><span style="color: #BDBDBD; font-size: 20px">&#9733;&#9733;&#9733;&#9733;</span></p>`;
    } else if (skill.stars === 2 || skill.stars === "2") {
      return `<p>${skill.name} <span style="color: #FFB400; font-size: 20px">${twoStars}</span><span style="color: #BDBDBD; font-size: 20px">&#9733;&#9733;&#9733;</span></p>`;
    } else if (skill.stars === 3 || skill.stars === "3") {
      return `<p>${skill.name} <span style="color: #FFB400; font-size: 20px">${threeStars}</span><span style="color: #BDBDBD; font-size: 20px">&#9733;&#9733;</span></p>`;
    } else if (skill.stars === 4 || skill.stars === "4") {
      return `<p>${skill.name} <span style="color: #FFB400; font-size: 20px">${fourStars}</span><span style="color: #BDBDBD; font-size: 20px">&#9733;</span></p>`;
    } else if (skill.stars === 5 || skill.stars === "5") {
      return `<p>${skill.name} <span style="color: #FFB400; font-size: 20px">${fiveStars}</span></p>`;
    }
  });

  const mappedLanguages = languages.map((language) => {
    const oneStar = "&#9733;";
    const twoStars = "&#9733;&#9733;";
    const threeStars = "&#9733;&#9733;&#9733;";
    const fourStars = "&#9733;&#9733;&#9733;&#9733;";
    const fiveStars = "&#9733;&#9733;&#9733;&#9733;&#9733;";
    if (language.stars === 1 || language.stars === "1") {
      return `<p>${language.name} <span style="color: #FFB400; font-size: 20px">${oneStar}</span><span style="color: #BDBDBD; font-size: 20px">&#9733;&#9733;&#9733;&#9733;</span></p>`;
    } else if (language.stars === 2 || language.stars === "2") {
      return `<p>${language.name} <span style="color: #FFB400; font-size: 20px">${twoStars}</span><span style="color: #BDBDBD; font-size: 20px">&#9733;&#9733;&#9733;</span></p>`;
    } else if (language.stars === 3 || language.stars === "3") {
      return `<p>${language.name} <span style="color: #FFB400; font-size: 20px">${threeStars}</span><span style="color: #BDBDBD; font-size: 20px">&#9733;&#9733;</span></p>`;
    } else if (language.stars === 4 || language.stars === "4") {
      return `<p>${language.name} <span style="color: #FFB400; font-size: 20px">${fourStars}</span><span style="color: #BDBDBD; font-size: 20px">&#9733;</span></p>`;
    } else if (language.stars === 5 || language.stars === "5") {
      return `<p>${language.name} <span style="color: #FFB400; font-size: 20px">${fiveStars}</span></p>`;
    }
  });

  const mappedHobbies = hobbies.map((hobby) => {
    return "<p>" + hobby.name + "</p>";
  });

  const mappedExperiences = experiences.map((experience) => {
    return `
      <div style="border-top: 1px solid #fff; border-bottom: 1px solid #e1e1e1; padding: 0px; margin-bottom: 20px; page-break-inside: avoid;">
            <h4 style="margin: 10px 0px; padding: 0px;">${experience.name}</h4>
            <p
                style="
                    font-style: italic;
                    color: dark-grey;
                    font-size: 90%;
                    margin: 5px 0px 0px 0px;
                "
            >
                ${experience.fromDate.split("T")[0]} - ${
      experience.toDate !== null ? experience.toDate.split("T")[0] : "Present"
    }
            </p>
            <p>${experience.description}</p>
            <p style="font-weight: bold; margin: 0px">
                Tools
            </p>
            <p>${experience.tools}</p>
            
        </div>
      `;
  });

  const mappedEducations = educations.map((education) => {
    return `
      <div style="border-top: 1px solid #fff; border-bottom: 1px solid #e1e1e1; padding: 0px; margin-bottom: 20px; margin-top: 20px; page-break-inside: avoid; max-width: 47%">
            <h4 style="margin: 10px 0px; padding: 0px; max-width: 100%">${
              education.name
            }</h4>
            <p
                style="
                    font-style: italic;
                    color: dark-grey;
                    font-size: 90%;
                    margin: 5px 0px 0px 0px;
                "
            >
                ${education.fromDate.split("T")[0]} - ${
      education.toDate !== null ? education.toDate.split("T")[0] : "Present"
    }
            </p>
            <p>${education.school}</p>           
        </div>
      `;
  });

  return `
    <!doctype html>
    <html>
       <head>
          <meta charset="utf-8">
          <title>Consultant PDF Template</title>
          <!--<style>
            h2{
              font-size: 30pt;
            }
            h3{
              font-size: 25pt;
            }
            h4{
              font-size: 20pt;
            }
            p{
              font-size: 15pt;
            }
          </style>-->
       </head>
       <body style="background-color: #fff; padding: 0px 0px 0px 0px; margin: 0px; font-family: Arial;">
       <div style="background-color: #13222d; width: 100%">
       <div
      style=" 
      width: 100%
      background-color: #13222d;
      padding: 20px;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -ms-flex-wrap: wrap;
          flex-wrap: wrap;
      -webkit-box-align: center;
      -ms-flex-align: center;
              align-items: center;
      "
    >
      <img
        src="${profilePic()}"
        style="
        -o-object-fit: cover;
        object-fit: cover;
        width: 150px;
        height: 150px;
        border-radius: 50%;
        -webkit-box-shadow: 0px 1px 16px -4px rgba(0, 0, 0, 0.75);
                box-shadow: 0px 1px 16px -4px rgba(0, 0, 0, 0.75);
        border: 2px solid #13222d;
        position: relative;
        top: 0;
        left: 0;
        "
			/>
			<div
              style=" color: white; margin-left: 10px; min-width: 40% "
            >
              ${anonymousName()}
              <h4 style=" margin: 0px; padding: 0px">${consultant.title}</h4>
              ${managerInfo()}
              ${anonymousContactInfo()}
            </div>
            
            
            <img src="${drLogo()}" style="width: 150px; position: absolute; right: 10px; top: 130px"/>
           </div> 
          </div>
          <div style="display: -webkit-box; display: -ms-flexbox; display: flex; background-color: white; padding: 20px;">
            <div style="width: 60%; padding-right: 15px; border-right: 1px solid #e1e1e1">
                <h3 style="margin-bottom: 0px">Presentation</h3>
                <p>${presentationSetter()}</p>
                <div style="margin: 30px 0px" }}>
                    <h3 style="margin-bottom: 0px; margin-top: 40px">Experiences</h3>
                    <div>${mappedExperiences.join(" ")}</div>
                </div>
            </div>
            <div>
                <div style="padding-left: 15px;">
                    <h3 style="margin-bottom: 0px">Skills</h3>
                        <div tyle="padding-bottom: 30px">
                            ${mappedSkills.join(" ")}
                        </div>
                </div>
                <div style="padding-left: 15px; margin-top: 40px">
                    <h3 style="margin-bottom: 0px">Languages</h3>
                        <div tyle="padding-bottom: 30px">
                            ${mappedLanguages.join(" ")}
                        </div>
                </div>
                <div style="padding-left: 15px; margin-top: 40px">
                    <h3 style="margin-bottom: 0px">Hobbies</h3>
                        <div tyle="padding-bottom: 10px">
                            ${mappedHobbies.join(" ")}
                        </div>
                </div>
                <div style="padding-left: 15px; padding-right: 15px; margin-top: 20px; border-top: 1px solid #fff; width: 77%;">
                    <h3 style="margin-bottom: 0px; border-top: 1px solid #fff;">Education</h3>
                        <div tyle="padding-bottom: 30px;">
                            ${mappedEducations.join(" ")}
                        </div>
                </div>
            </div>
          </div>
    </div>
    
       </body>
    </html>
    `;
};
