import React, { useState } from "react";
import { validateVillagerData, normalizeVillagerData } from "../utils/dataAdapter";

export default function SchemaValidator({ onValidatedData, className = "" }) {
  const [jsonInput, setJsonInput] = useState("");
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleValidate = () => {
    if (!jsonInput.trim()) {
      setValidationResult({
        isValid: false,
        errors: ["Please enter JSON data to validate"],
        data: null
      });
      return;
    }

    setIsValidating(true);
    
    try {
      const parsedData = JSON.parse(jsonInput);
      const normalizedData = normalizeVillagerData(Array.isArray(parsedData) ? parsedData : [parsedData]);
      
      if (normalizedData.length === 0) {
        setValidationResult({
          isValid: false,
          errors: ["No valid villager data found"],
          data: null
        });
        return;
      }

      const validationResults = normalizedData.map((villager, index) => ({
        index,
        villager,
        validation: validateVillagerData(villager)
      }));

      const allValid = validationResults.every(result => result.validation.isValid);
      const allErrors = validationResults.flatMap(result => 
        result.validation.errors.map(error => `Villager ${result.index + 1}: ${error}`)
      );

      setValidationResult({
        isValid: allValid,
        errors: allErrors,
        data: normalizedData,
        count: normalizedData.length
      });

      if (allValid && onValidatedData) {
        onValidatedData(normalizedData);
      }

    } catch (error) {
      setValidationResult({
        isValid: false,
        errors: [`JSON parsing error: ${error.message}`],
        data: null
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleLoadSample = () => {
    const sampleData = [
      {
        name: "Test Villager",
        species: "Cat",
        gender: "Female",
        personality: "Normal",
        birthday: "January 1",
        catchphrase: "test",
        poster_image_url: "https://example.com/image.png",
        hobby: "Reading",
        house_song: "K.K. Ballad",
        appearances: ["New Horizons"],
        page_url: "https://nookipedia.com/wiki/Test_Villager",
        favorite_gifts: {
          favorite_styles: ["Simple", "Cool"],
          favorite_colors: ["Blue", "White"],
          ideal_clothing_examples: ["Sweater", "Hat"]
        }
      }
    ];
    
    setJsonInput(JSON.stringify(sampleData, null, 2));
    setValidationResult(null);
  };

  return (
    <div className={`schema-validator ${className}`}>
      <div className="validator-header">
        <h3>🔍 Schema Validator</h3>
        <p>Test and validate villager data against the new schema format</p>
      </div>

      <div className="validator-controls">
        <button 
          onClick={handleLoadSample}
          className="sample-button"
          type="button"
        >
          Load Sample Data
        </button>
        <button 
          onClick={handleValidate}
          disabled={isValidating || !jsonInput.trim()}
          className="validate-button"
          type="button"
        >
          {isValidating ? "Validating..." : "Validate Data"}
        </button>
      </div>

      <div className="validator-input">
        <label htmlFor="json-input" className="input-label">
          JSON Data (paste villager data here):
        </label>
        <textarea
          id="json-input"
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder="Paste your villager JSON data here..."
          className="json-textarea"
          rows={10}
        />
      </div>

      {validationResult && (
        <div className={`validation-result ${validationResult.isValid ? "valid" : "invalid"}`}>
          <div className="result-header">
            <span className="result-icon">
              {validationResult.isValid ? "✅" : "❌"}
            </span>
            <h4>
              {validationResult.isValid 
                ? `Valid! ${validationResult.count} villager(s) processed` 
                : "Validation Failed"
              }
            </h4>
          </div>

          {validationResult.errors.length > 0 && (
            <div className="validation-errors">
              <h5>Issues found:</h5>
              <ul>
                {validationResult.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {validationResult.isValid && validationResult.data && (
            <div className="validation-success">
              <p>Data has been successfully validated and normalized!</p>
              <details>
                <summary>View processed data</summary>
                <pre className="processed-data">
                  {JSON.stringify(validationResult.data, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
