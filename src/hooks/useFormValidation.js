import { useState, useCallback } from "react";

/**
 * useFormValidation Hook
 *
 * Custom hook for form validation and error handling
 * Provides error states, validation functions, and helper methods
 */
export const useFormValidation = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validate a single field
  const validateField = useCallback(
    (name, value) => {
      if (!validationRules[name]) return "";

      const rule = validationRules[name];
      if (typeof rule === "function") {
        return rule(value, values);
      }

      if (rule.required && !value) {
        return `${name} is required`;
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        return rule.message || `Invalid ${name}`;
      }

      if (rule.custom) {
        return rule.custom(value, values);
      }

      return "";
    },
    [validationRules, values]
  );

  // Handle field change
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setValues((prev) => ({ ...prev, [name]: value }));

      // Clear error when field is modified
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [errors]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));

      const error = validateField(name, value);
      if (error) {
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [validateField]
  );

  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach((name) => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validateField, validationRules, values]);

  return {
    values,
    setValues,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    validateField,
  };
};
