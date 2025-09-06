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
  Button,
  Grid,
  Alert,
  AlertTitle,
} from "@mui/material";
import { motion } from "framer-motion";
import { styled } from "@mui/material/styles";

import Navbar from "@/app/(auth)/navbar/page";

// Styled Components (Same as Login component)
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

const LogoContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: theme.spacing(4),
  gap: theme.spacing(2),
}));

const LinkContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(3),
  marginTop: theme.spacing(3),
}));

const StyledLink = styled(Link)(({ theme }) => ({
  color: "#2c50d3ff",
  textDecoration: "none",
  fontWeight: 500,
  fontSize: "1rem",
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
    maxWidth: "800px",
    height: "100%",
    minHeight: "600px",
  },
}));

const CopyrightBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: "center",
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  fontSize: "1.1rem",
  fontWeight: 600,
  padding: theme.spacing(3),
  "& .MuiAlert-message": {
    width: "100%",
    textAlign: "center",
  },
}));

const Register = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <>
      <Navbar />
      <GradientBox>
        <Container maxWidth="xl">
          <Grid
            container
            spacing={6}
            alignItems="center"
            justifyContent="center"
            sx={{ minHeight: "90vh" }}
          >
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
                    alt="Register Illustration"
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
                        sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}
                      >
                        Register
                      </Typography>
                    </LogoContainer>

                    {/* Registration Content */}
                    <Box mb={4}>
                      <StyledAlert severity="info" variant="outlined" >
                        <Typography
                          variant="h6"
                          component="div"
                          sx={{
                            fontWeight: 600,
                            lineHeight: 1.5,
                            textAlign: "center",
                          }}
                        >
                          Send WhatsApp message:{" "}
                          <Box
                            component="span"
                            sx={{
                              display: "block",
                              mt: 2,
                              p: 2,
                              backgroundColor: "#f0f0f0",
                              borderRadius: 2,
                              fontFamily: "monospace",
                              fontSize: "1.1rem",
                              color: "#2c50d3ff",
                              fontWeight: "bold",
                            }}
                          >
                            &lt;User YOURNAME&gt;
                          </Box>
                          <Box
                            component="span"
                            sx={{ display: "block", mt: 2 }}
                          >
                            to: <strong>+918130960040</strong>
                          </Box>
                        </Typography>
                      </StyledAlert>
                    </Box>

                    {/* Links */}
                    <LinkContainer>
                      <StyledLink href="/login">
                        Already have an account? Login
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

export default Register;
