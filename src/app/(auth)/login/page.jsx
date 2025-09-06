"use client";

import React, { useState, useEffect } from "react";
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
  InputAdornment,
  IconButton,
  Divider,
  Grid,
  FormControl,
  OutlinedInput,
  InputLabel,
} from "@mui/material";
import {
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { styled } from "@mui/material/styles";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useToast } from "@/app/component/customtoast/page";

import Navbar from "@/app/(auth)/navbar/page"

// Styled Components
const GradientBox = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(4, 2),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6, 5), // Increased padding
  borderRadius: theme.spacing(4), // More rounded corners
  boxShadow: "0 25px 50px rgba(0,0,0,0.15)", // Enhanced shadow
  maxWidth: "580px", // Increased from 500px
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
  padding: theme.spacing(0.8, 2), // Increased padding
  fontSize: "1.2rem", // Larger font
  fontWeight: 600,
  borderRadius: theme.spacing(1.5),
  textTransform: "none",
  transition: "all 0.3s ease",
  border: "2px solid #2c50d3ff",
  color: "#2c50d3ff",
  backgroundColor: "white",
  minHeight: "36px", // Ensures consistent height
  "&:hover": {
    backgroundColor: "#2c50d3ff",
    color: "white",
    transform: "translateY(-3px)",
    boxShadow: "0 12px 24px rgba(70, 101, 193, 0.4)",
  },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: theme.spacing(4), // Increased margin
  gap: theme.spacing(2),
}));

const LinkContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(3), // Increased gap
  marginTop: theme.spacing(3),
}));

const StyledLink = styled(Link)(({ theme }) => ({
  color: "#2c50d3ff",
  textDecoration: "none",
  fontWeight: 500,
  fontSize: "1rem", // Slightly larger
  transition: "color 0.3s ease",
  "&:hover": {
    color: "#2c50d3ff",
    textDecoration: "underline",
  },
}));

const IllustrationContainer = styled(Box)(({ theme }) => ({
  display: "none",
  [theme.breakpoints.up("lg")]: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: "800px", // Increased from 600px
    height: "100%",
    minHeight: "600px", // Added minimum height
  },
}));

const CopyrightBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: "center",
}));

// Enhanced FormControl styling
const StyledFormControl = styled(FormControl)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.spacing(1.5),
    fontSize: "1.1rem",
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

const Login = () => {
  const router = useRouter();
  const { addToast } = useToast();
  const [formValues, setFormValues] = useState({
    whatsapp: "",
    passcode: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);

  const togglePasscodeVisibility = () => {
    setShowPasscode(!showPasscode);
  };

  const handleInputChange = (name, value) => {
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formValues.whatsapp || !formValues.passcode) {
    return addToast("Enter number and password", "error");
  }
  setIsLoading(true);

  let response;
  try {
    response = await fetch("https://www.margda.in/miraj/work/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        whatsapp: formValues.whatsapp,
        password: formValues.passcode,
      }),
    });
    const userData = await response.json();
    
    if (response.status === 404) {
      addToast(userData.message, "error");
      setIsLoading(false);
    } else if (response.status === 401) {
      addToast(userData.message, "error");
      setIsLoading(false);
    } else if (response.status === 200) {
      const data = userData.user_data;
      sessionStorage.setItem("userData", JSON.stringify(data));
      
      // Redirect directly to dashboard without profile update
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } else {
      addToast("An unexpected error occurred. Please try again.", "error");
      setIsLoading(false);
    }
  } catch (error) {
    console.error("Login error:", error);
    if (error.message === "Failed to fetch") {
      addToast(
        "Network error: Please check your internet connection",
        "error"
      );
    } else {
      addToast(
        "Failed to connect to the server. Please try again later.",
        "error"
      );
    }
    setIsLoading(false);
  }
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
            <Grid item xs={12} lg={7}> {/* Increased from lg={6} */}
              <IllustrationContainer>
                <motion.div
                  variants={imageVariants}
                  initial="hidden"
                  animate="visible"
                  style={{ width: "100%", height: "100%" }}
                >
                  <Image
                    src="/Illustration.png"
                    alt="Login Illustration"
                    width={900} // Increased from 1200
                    height={700} // Increased height
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
            <Grid item xs={12} lg={5}> {/* Decreased from lg={6} to lg={5} for better balance */}
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
                        width={220} // Increased from 48
                        height={56}
                        style={{ width: "56px", height: "auto" }}
                      />
                      <Typography
                        variant="h3" // Changed from h4 to h3
                        component="h1"
                        fontWeight="bold"
                        color="text.primary"
                        sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}
                      >
                        Login
                      </Typography>
                    </LogoContainer>

                    {/* Form */}
                    <Box component="form" onSubmit={handleSubmit}>
                      {/* WhatsApp Number Input */}
                      <Box mb={4}> {/* Increased margin */}
                        <Typography
                          variant="body1" // Changed from body2
                          color="text.secondary"
                          mb={1.5}
                          fontWeight={600}
                          sx={{ fontSize: "1.1rem" }}
                        >
                          WhatsApp Number
                        </Typography>
                        <PhoneInput
                          country={"in"}
                          value={formValues.whatsapp}
                          onChange={(value) => handleInputChange("whatsapp", value)}
                          placeholder="WhatsApp Number"
                          inputStyle={{
                            width: "100%",
                            paddingLeft: "3.5rem",
                            paddingRight: "1.5rem",
                            paddingTop: "25px", // Increased padding
                            paddingBottom: "20px",
                            border: "2px solid #dadce4ff", // Thicker border
                            borderRadius: "12px", // More rounded
                            fontSize: "1.1rem", // Larger font
                            lineHeight: "1.5rem",
                            color: "#374151",
                            backgroundColor: "white",
                            
                            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                          }}
                          buttonStyle={{
                            border: "2px solid #d1d5db",
                            borderRadius: "12px 0 0 12px",
                            backgroundColor: "white",
                            height: "48px", // Match input height
                          }}
                          dropdownStyle={{
                            borderRadius: "12px",
                            zIndex: 9999,
                          }}
                          containerClass="phone-input-container"
                        />
                      </Box>

                      {/* Passcode Input */}
                      <Box mb={3}> {/* Increased margin */}
                        <StyledFormControl fullWidth variant="outlined">
                          <InputLabel htmlFor="outlined-adornment-password">
                            Password
                          </InputLabel>
                          <OutlinedInput
                            id="outlined-adornment-password"
                            type={showPasscode ? "text" : "password"}
                            value={formValues.passcode}
                            onChange={(e) =>
                              handleInputChange("passcode", e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleSubmit(e);
                              }
                            }}
                            startAdornment={
                              <InputAdornment position="start">
                                <LockIcon sx={{ color: "blue", fontSize: "1.5rem" }} />
                              </InputAdornment>
                            }
                            endAdornment={
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="toggle password visibility"
                                  onClick={togglePasscodeVisibility}
                                  edge="end"
                                  size="large"
                                >
                                  {showPasscode ? 
                                    <VisibilityOff sx={{ fontSize: "1.5rem" }} /> : 
                                    <Visibility sx={{ fontSize: "1.5rem" }} />
                                  }
                                </IconButton>
                              </InputAdornment>
                            }
                            label="Password"
                          />
                        </StyledFormControl>
                      </Box>

                      {/* Submit Button */}
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <StyledButton
                          type="submit"
                          fullWidth
                          disabled={isLoading}
                          size="small"
                        >
                          {isLoading ? "Signing In..." : "Submit"}
                        </StyledButton>
                      </motion.div>
                    </Box>

                    {/* Links */}
                    <LinkContainer>
                      <StyledLink href="/forget-passcode">
                        Forget Passcode?
                      </StyledLink>
                      <Divider orientation="vertical" flexItem sx={{ borderColor: "#6B46C1" }} />
                      <StyledLink href="/register">
                        Register
                      </StyledLink>
                    </LinkContainer>
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

export default Login;
