// script.js

document.getElementById("imageForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  const description = document.getElementById("description").value.trim();
  const baseImageInput = document.getElementById("baseImage");
  const loadingMessage = document.getElementById("loadingMessage");
  const errorMessage = document.getElementById("errorMessage");
  const resultImage = document.getElementById("resultImage");

  loadingMessage.style.display = "block";
  errorMessage.style.display = "none";
  resultImage.style.display = "none";

  if (!description) {
      errorMessage.textContent = "Please provide a description.";
      errorMessage.style.display = "block";
      loadingMessage.style.display = "none";
      return;
  }

  try {
      const API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2";
      const API_TOKEN = "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"; // Replace with your token

      // Create form data
      const formData = new FormData();
      formData.append("inputs", description);

      // Add the base image if provided
      if (baseImageInput.files.length > 0) {
          const baseImage = baseImageInput.files[0];
          formData.append("image", baseImage);
      }

      // Make the API request
      const response = await fetch(API_URL, {
          method: "POST",
          headers: {
              "Authorization": `Bearer ${API_TOKEN}`,
          },
          body: formData,
      });

      if (!response.ok) {
          const errorDetails = await response.json();
          throw new Error(errorDetails.error || "Failed to generate image.");
      }

      // Process the response
      const imageBlob = await response.blob();
      const imageURL = URL.createObjectURL(imageBlob);

      resultImage.src = imageURL;
      resultImage.style.display = "block";
  } catch (error) {
      errorMessage.textContent = "Error: " + error.message;
      errorMessage.style.display = "block";
  } finally {
      loadingMessage.style.display = "none";
  }
});
