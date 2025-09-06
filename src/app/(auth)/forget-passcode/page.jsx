"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Grid,
  Alert,
} from "@mui/material";
import {
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Sms as SmsIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { styled } from "@mui/material/styles";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useToast } from "@/app/component/customtoast/page";
import Navbar from "@/app/(auth)/navbar/page"

// Styled Components (Same as Login/Register components)
const GradientBox = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(4, 2),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6, 5),
  borderRadius: theme.spacing(4),
  boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
  maxWidth: "580px",
  width: "100%",
  backdropFilter: "blur(10px)",
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(4, 3),
    margin: theme.spacing(2),
    maxWidth: "100%",
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(0.8, 2),
  fontSize: "1.2rem",
  fontWeight: 600,
  borderRadius: theme.spacing(1.5),
  textTransform: "none",
  transition: "all 0.3s ease",
  border: "2px solid #2c50d3ff",
  color: "#2c50d3ff",
  backgroundColor: "white",
  minHeight: "36px",
  "&:hover": {
    backgroundColor: "#2c50d3ff",
    color: "white",
    transform: "translateY(-3px)",
    boxShadow: "0 12px 24px rgba(70, 80, 193, 0.4)",
  },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: theme.spacing(4),
  gap: theme.spacing(2),
}));

const IllustrationContainer = styled(Box)(({ theme }) => ({
  display: "none",
  [theme.breakpoints.up("lg")]: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: "800px",
    height: "100%",
    minHeight: "600px",
  },
}));

const CopyrightBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: "center",
}));

const StyledRadioGroup = styled(RadioGroup)(({ theme }) => ({
  flexDirection: "row",
  gap: theme.spacing(2),
  justifyContent: "space-between",
  "& .MuiFormControlLabel-root": {
    margin: 0,
    backgroundColor: "rgba(107, 70, 193, 0.05)",
    borderRadius: theme.spacing(1),
    padding: theme.spacing(1, 2),
    border: "1px solid rgba(107, 70, 193, 0.2)",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "rgba(107, 70, 193, 0.1)",
    },
    "& .Mui-checked": {
      color: "#2c50d3ff",
    },
  },
  "& .MuiRadio-root": {
    padding: theme.spacing(0.5),
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.spacing(1.5),
    fontSize: "1.1rem",
    backgroundColor: "white",
    "& fieldset": {
      borderColor: "#d1d5db",
      borderWidth: "2px",
    },
    "&:hover fieldset": {
      borderColor: "#2c50d3ff",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#2c50d3ff",
      borderWidth: "2px",
    },
  },
  "& .MuiInputLabel-root": {
    fontSize: "1.1rem",
    "&.Mui-focused": {
      color: "#2c50d3ff",
    },
  },
  "& .MuiOutlinedInput-input": {
    padding: theme.spacing(1.3, 1.5),
  },
}));

const ForgetPasscode = () => {
  const router = useRouter();
  const { addToast } = useToast();
  const [deliveryMethod, setDeliveryMethod] = useState("whatsapp");
  const [contact, setContact] = useState("");
  const [errors, setErrors] = useState({});

  const handleDeliveryChange = (event) => {
    setDeliveryMethod(event.target.value);
    setContact(""); // Reset contact when switching delivery method
    setErrors({}); // Clear errors
  };

  const handleContactChange = (value) => {
    setContact(value);
    setErrors({}); // Clear errors when user starts typing
  };

  const validateForm = () => {
    const newErrors = {};
    if (!contact) {
      newErrors.contact = `Please input your ${
        deliveryMethod.charAt(0).toUpperCase() + deliveryMethod.slice(1)
      } contact.`;
    } else if (deliveryMethod !== "email") {
      // Basic phone number validation (ensure it has at least 10 digits including country code)
      const phoneRegex = /^\+?\d{10,}$/;
      if (!phoneRegex.test(contact.replace(/\s/g, ""))) {
        newErrors.contact = "Please enter a valid phone number.";
      }
    } else {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contact)) {
        newErrors.contact = "Please enter a valid email address.";
      }
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Object.values(newErrors).forEach((error) => addToast(error, "error"));
      return;
    }

    // Placeholder for successful submission
    addToast(
      `Passcode sent via ${deliveryMethod} to ${contact}!`,
      "success"
    );
    setTimeout(() => {
      router.push("/work/login");
    }, 2000);
  };

  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const imageVariants = {
    hidden: { opacity: 0, x: -100, scale: 0.8 },
    visible: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: { duration: 0.8, ease: "easeOut" } 
    },
  };

  return (
    <>
    <Navbar/>
      <GradientBox>
        <Container maxWidth="xl">
          <Grid container spacing={6} alignItems="center" justifyContent="center" sx={{ minHeight: "90vh" }}>
            {/* Illustration Section - Hidden on Mobile */}
            <Grid item xs={12} lg={7}>
              <IllustrationContainer>
                <motion.div
                  variants={imageVariants}
                  initial="hidden"
                  animate="visible"
                  style={{ width: "100%", height: "100%" }}
                >
                  <Image
                    src="/Illustration.png"
                    alt="Forget Passcode Illustration"
                    width={900}
                    height={700}
                    style={{
                      width: "100%",
                      height: "auto",
                      maxWidth: "900px",
                      objectFit: "contain",
                    }}
                    priority
                  />
                </motion.div>
              </IllustrationContainer>
            </Grid>

            {/* Form Section */}
            <Grid item xs={12} lg={5}>
              <Box display="flex" justifyContent="center">
                <motion.div
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  style={{ width: "100%", maxWidth: "580px" }}
                >
                  <StyledPaper elevation={0}>
                    {/* Logo and Title */}
                    <LogoContainer>
                      <Image
                        src="/logoicon.png"
                        alt="Logo"
                        width={56}
                        height={56}
                        style={{ width: "56px", height: "auto" }}
                      />
                      <Typography
                        variant="h3"
                        component="h1"
                        fontWeight="bold"
                        color="text.primary"
                        sx={{ fontSize: { xs: "1.8rem", md: "2.2rem" } }}
                      >
                        Forget Passcode
                      </Typography>
                    </LogoContainer>

                    {/* Form */}
                    <Box component="form" onSubmit={handleSubmit}>
                      {/* Delivery Method Selection */}
                      <Box mb={4}>
                        <FormControl component="fieldset">
                          <FormLabel 
                            component="legend" 
                            sx={{ 
                              fontSize: "1.1rem", 
                              fontWeight: 600,
                              color: "text.secondary",
                              mb: 2,
                              "&.Mui-focused": { color: "#2c50d3ff" }
                            }}
                          >
                            Choose delivery method:
                          </FormLabel>
                          <StyledRadioGroup
                            value={deliveryMethod}
                            onChange={handleDeliveryChange}
                          >
                            <FormControlLabel
                              value="whatsapp"
                              control={<Radio />}
                              label={
                                <Box display="flex" alignItems="center" gap={1}>
                                  <WhatsAppIcon sx={{ color: "#2c50d3ff" }} />
                                  <Typography variant="body1" fontWeight={500}>
                                    WhatsApp
                                  </Typography>
                                </Box>
                              }
                            />
                            <FormControlLabel
                              value="sms"
                              control={<Radio />}
                              label={
                                <Box display="flex" alignItems="center" gap={1}>
                                  <SmsIcon sx={{ color: "#2c50d3ff" }} />
                                  <Typography variant="body1" fontWeight={500}>
                                    SMS
                                  </Typography>
                                </Box>
                              }
                            />
                            <FormControlLabel
                              value="email"
                              control={<Radio />}
                              label={
                                <Box display="flex" alignItems="center" gap={1}>
                                  <EmailIcon sx={{ color: "#2c50d3ff" }} />
                                  <Typography variant="body1" fontWeight={500}>
                                    Email
                                  </Typography>
                                </Box>
                              }
                            />
                          </StyledRadioGroup>
                        </FormControl>
                      </Box>

                      {/* Contact Input */}
                      <Box mb={4}>
                        {deliveryMethod !== "email" ? (
                          <Box>
                            <Typography
                              variant="body1"
                              color="text.secondary"
                              mb={1.5}
                              fontWeight={600}
                              sx={{ fontSize: "1.1rem" }}
                            >
                              Phone Number
                            </Typography>
                            <PhoneInput
                              country={"in"}
                              value={contact}
                              onChange={handleContactChange}
                              placeholder="Phone Number"
                              inputStyle={{
                                width: "100%",
                                paddingLeft: "3.5rem",
                                paddingRight: "1.5rem",
                                paddingTop: "25px",
                                paddingBottom: "30px",
                                border: "2px solid #d1d5db",
                                borderRadius: "12px",
                                fontSize: "1.1rem",
                                lineHeight: "1.5rem",
                                color: "#374151",
                                backgroundColor: "white",
                                fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                              }}
                              buttonStyle={{
                                border: "2px solid #d1d5db",
                                borderRadius: "12px 0 0 12px",
                                backgroundColor: "white",
                                height: "57px",
                              }}
                              dropdownStyle={{
                                borderRadius: "12px",
                                zIndex: 9999,
                              }}
                              containerClass="phone-input-container"
                            />
                          </Box>
                        ) : (
                          <StyledTextField
                            fullWidth
                            id="contact"
                            label="Email Address"
                            variant="outlined"
                            value={contact}
                            onChange={(e) => handleContactChange(e.target.value)}
                            error={!!errors.contact}
                            helperText={errors.contact}
                            InputProps={{
                              startAdornment: (
                                <PersonIcon sx={{ color: "#6B46C1", mr: 1 }} />
                              ),
                            }}
                          />
                        )}
                        {errors.contact && deliveryMethod !== "email" && (
                          <Alert severity="error" sx={{ mt: 1, borderRadius: 2 }}>
                            {errors.contact}
                          </Alert>
                        )}
                      </Box>

                      {/* Submit Button */}
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <StyledButton
                          type="submit"
                          fullWidth
                          size="small"
                        >
                          Send Passcode
                        </StyledButton>
                      </motion.div>
                    </Box>

                    {/* Back to Login Link */}
                    <Box textAlign="center" mt={3}>
                      <Link href="/login" style={{ textDecoration: "none" }}>
                        <Typography
                          variant="body1"
                          sx={{
                            color: "#2c50d3ff",
                            fontWeight: 500,
                            "&:hover": {
                              color: "#2c50d3ff",
                              textDecoration: "underline",
                            },
                          }}
                        >
                          Back to Login
                        </Typography>
                      </Link>
                    </Box>
                  </StyledPaper>
                </motion.div>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </GradientBox>

      {/* Copyright */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
      >
        <CopyrightBox>
          <Typography variant="h6" fontWeight="bold" color="text.primary">
            Copyright © {new Date().getFullYear()} Digital Softech. All rights
            reserved.
          </Typography>
        </CopyrightBox>
      </motion.div>
    </>
  );
};

export default ForgetPasscode;
