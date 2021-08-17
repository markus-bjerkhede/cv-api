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
  const base64ImageProfilePic = () => {
    const fs = require("fs");
    const placeholderAsBase64 = fs.readFileSync(
      "./images/placeholder.PNG",
      "base64"
    );
    const profilePicAsBase64 = fs.readFileSync(
      `./images/${consultant.profilePic}`,
      "base64"
    );
    if (process.env.ENVIRONMENT !== "development") {
      if (!anonymousProfile) {
        return `src="data:image/png;base64, ${profilePicAsBase64}"`;
      } else {
        return `src="data:image/png;base64, ${placeholderAsBase64}"`;
      }
    } else {
      if (!anonymousProfile) {
        return `src="data:image/png;base64, ${profilePicAsBase64}"`;
      } else {
        return `src="data:image/png;base64, ${placeholderAsBase64}"`;
      }
    }
  };

  const base64Logo = () => {
    const fs = require("fs");
    const logoAsBase64 = fs.readFileSync("./images/dr_logo.png", "base64");
    if (process.env.ENVIRONMENT !== "development") {
      return `src="data:image/png;base64, ${logoAsBase64}"`;
    } else {
      return `src="data:image/png;base64, ${logoAsBase64}"`;
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
      return ` <h3 style="font-weight: bold; font-size: 20px;">
      ${consultant.firstname} ${consultant.lastname}
    </h3>`;
    } else {
      return ` <h3 style="font-weight: bold; font-size: 20px;">
      Anonymous
    </h3>`;
    }
  };

  const anonymousContactInfo = () => {
    if (
      (!anonymousProfile && managerResume) ||
      (anonymousProfile && managerResume) ||
      (!anonymousProfile && !managerResume)
    ) {
      return `<p style="margin: 2px 0px; padding: 2px 0px;"><span style="font-size: 15px">&#128231;</span> 
      ${consultant.email}
      </p>
      <p style="margin-top: 0px; padding-top: 0px;"><span style="font-size: 15px">&#128222;</span> 
      ${consultant.phone}
      </p>`;
    } else if (anonymousProfile && !managerResume) {
      return `<p style="margin: 2px 0px; padding: 2px 0px;"><span style="font-size: 15px">&#128231;</span> 
      Anonymous
      </p>
      <p style="margin-top: 0px; padding-top: 0px;"><span style="font-size: 15px">&#128222;</span> 
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
            <p>${experience.name}</p>
            <p>
            ${experience.fromDate.split("T")[0]} - ${
      experience.toDate !== null ? experience.toDate.split("T")[0] : "Present"
    }
            </p>
            <p>${experience.description}</p>
            <p style="font-weight: bold;">
                Tools
            </p>
            <p>${experience.tools}</p>
            <p style="border-bottom: 1px solid hsl(0, 75%, 60%);" />
            
      `;
  });

  const mappedEducations = educations.map((education) => {
    return `<p>${education.name}</p>
            <p>
                ${education.fromDate.split("T")[0]} - ${
      education.toDate !== null ? education.toDate.split("T")[0] : "Present"
    }
            </p>
            <p>${education.school}</p>
            <p />         
      `;
  });

  return `<!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <title>Document</title>
            <style>
            @page Section1 {
              margin:0in 0in 0in 0in;
              size:841.7pt 595.45pt;
              mso-page-orientation:landscape;
              mso-header-margin:0in;
              mso-header: h1;
              mso-footer-margin:0in;
              mso-footer: f1;
          }
      
          div.Section1 {page:Section1;}
            </style>
        </head>
        <body>
        <div class=Section1>
            <table border=1 cellspacing=10 cellpadding=10 style='border-collapse:collapse;border:none;mso-border-alt:solid windowtext .5pt;'>
                <tr style='height:1pt;mso-height-rule:exactly'>
                    <th style="background-color: #13222D; mso-element: header; padding: 100px">
                        <img
                            ${base64ImageProfilePic()}
                            alt="prfilePic"
                            style="height: 140px;"
                        />
                    </th>
                    <th style="vertical-align: center; background-color: #13222D; mso-element: header">
                    <p style="color: #13222D">Drakryggen Drakryggen Drakryggen Drakryggen Drakryggen Draken</p>
                        ${anonymousName()}
                        <h4 style="font-size: 15px; font-weight: bold;">${
                          consultant.title
                        }</h4>
                        ${managerInfo()}
                        ${anonymousContactInfo()}
                    </th>
                    <th style="vertical-align: bottom; background-color: #13222D; mso-element: header">
                        <img
                            ${base64Logo()}
                            alt="logo"
                            style="height: 50px"
                        />
                    </th>
                </tr>
                </table>
                <table  border=1 cellspacing=0 cellpadding=0 style='border-collapse:collapse;border:none;mso-border-alt:solid windowtext .5pt;'>
                <tr>
                    <td>        
                        <h3 style="font-weight: bold; font-size: 20px;">Presentation <span style="color: #FFF">Drakryggen Drakryggen Dr</span></h3>
                        <p>${presentationSetter()}</p>
                        <p /> 
                        <h3 style="font-weight: bold; font-size: 20px;">Experiences</h3> 
                        ${mappedExperiences.join(" ")}
                    </td>
                    <td>
                        <h3 style="font-weight: bold; font-size: 20px;">Skills</h3>    
                        ${mappedSkills.join(" ")}
                        <p />
                        <h3 style="font-weight: bold; font-size: 20px;">Languages</h3> 
                        ${mappedLanguages.join(" ")}
                        <p />
                        <h3 style="font-weight: bold; font-size: 20px;">Hobbies</h3> 
                        ${mappedHobbies.join(" ")}
                        <p />
                        <h3 style="font-weight: bold; font-size: 20px;">Educations</h3> 
                        ${mappedEducations.join(" ")}
                    </td>
                </tr>
            </table></div>
        </body>
    </html>`;
};
