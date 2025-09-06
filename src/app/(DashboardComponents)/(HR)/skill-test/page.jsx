'use client';

import { useEffect, useState } from "react";
import {
  FaBook,
  FaClock,
  FaCalculator,
  FaFileAlt,
  FaPlay,
  FaBookReader,
} from "react-icons/fa";
import Select from "react-select";
import { useToast } from "@/app/component/customtoast/page";
import { useRouter } from "next/navigation";

const SkillTest = () => {
  const { addToast } = useToast();
  const router = useRouter();
  const [selectedSkill, setSelectedSkill] = useState("");
  const [skillsOptions, setSkillsOptions] = useState([]);
  const [localUserData, setLocalUserData] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return;

    const userData = JSON.parse(localStorage.getItem("userData") || 'null');
    if (userData) {
      setLocalUserData(userData);
      setAccessToken(userData.access_token);
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchSkills();
    }
  }, [accessToken]);

  const fetchSkills = async () => {
    try {
      const response = await fetch(
        "https://www.margda.in/api/skills/test/fetch-tests",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        const skills = data.Skills || [];
        const formattedSkills = skills.map((skill) => ({
          ...skill,
          label: `Skill: ${skill.skillName}, Post: ${skill.postName}`,
          value: skill.resultID,
        }));

        setSkillsOptions(formattedSkills);
      } else {
        addToast(data.message, "error");
      }
    } catch (error) {
      console.error("Error fetching skills:", error);
      addToast("Unable to fetch skills, try again later", "error");
    }
  };

  const handleBeginTest = async () => {
    if (!selectedSkill) {
      addToast("Please select a skill first", "info");
      return;
    }
    try {
      const response = await fetch(
        "https://www.margda.in/api/skills/test/start-test",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vskillsID: selectedSkill.vskillsID,
            resultID: selectedSkill.resultID,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        // Store test data in sessionStorage for the test page
        sessionStorage.setItem("testData", JSON.stringify(data));
        router.push("/give-skill-test");
      } else {
        addToast(data.message, "error");
      }
    } catch (error) {
      console.error("Error starting test:", error);
      addToast("Unable to start test, try again later", "error");
    }
  };

  // Show loading if user data is not loaded yet
  if (!localUserData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Title Section */}
      <h2 className="text-4xl font-semibold flex items-center gap-3 mb-4">
        <FaBook className="text-custom-purple text-4xl" /> Skill Test
      </h2>

      <div className="bg-white shadow-lg rounded-xl w-full max-w-6xl p-10 border border-gray-300">
        {/* Skill Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FaBookReader className="text-blue-500" />
            Select Skill
          </label>
          <Select
            value={selectedSkill}
            onChange={setSelectedSkill}
            options={skillsOptions}
            placeholder="Select a Skill"
            className="w-full mt-1"
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            }}
            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
          />
        </div>

        {/* Input Fields Section */}
        {selectedSkill && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 pt-6 gap-6 mb-8">
            {/* No. of Questions */}
            <div>
              <label className="flex items-center gap-3 text-lg font-medium">
                <FaFileAlt className="text-custom-purple text-2xl" /> No. of
                Questions:
              </label>
              <input
                type="number"
                disabled
                className="w-full p-3 border rounded-lg text-lg mt-2 focus:ring-custom-purple focus:border-custom-purple focus:outline-none disabled:bg-gray-100"
                placeholder="Enter number"
                value={selectedSkill?.test_question || ''}
                readOnly
              />
            </div>

            {/* Time per question */}
            <div>
              <label className="flex items-center gap-3 text-lg font-medium">
                <FaClock className="text-custom-purple text-2xl" /> Total Time
                (minutes):
              </label>
              <input
                disabled
                type="number"
                className="w-full p-3 border rounded-lg text-lg mt-2 focus:ring-custom-purple focus:border-custom-purple focus:outline-none disabled:bg-gray-100"
                placeholder="Enter time"
                value={selectedSkill?.test_minutes || ''}
                readOnly
              />
            </div>

            {/* Total Marks */}
            <div>
              <label className="flex items-center gap-3 text-lg font-medium">
                <FaCalculator className="text-custom-purple text-2xl" /> Total
                Marks:
              </label>
              <input
                disabled
                type="number"
                className="w-full p-3 border rounded-lg text-lg mt-2 focus:ring-custom-purple focus:border-custom-purple focus:outline-none disabled:bg-gray-100"
                placeholder="Enter marks"
                value={selectedSkill?.marks_total || ''}
                readOnly
              />
            </div>

            {/* Negative Marks */}
            <div>
              <label className="flex items-center gap-3 text-lg font-medium">
                <FaCalculator className="text-custom-purple text-2xl" />{" "}
                Negative Marks:
              </label>
              <input
                type="number"
                disabled
                step="0.1"
                className="w-full p-3 border rounded-lg text-lg mt-2 focus:ring-custom-purple focus:border-custom-purple focus:outline-none disabled:bg-gray-100"
                placeholder="Enter marks"
                value={selectedSkill?.marks_wrong || ''}
                readOnly
              />
            </div>
          </div>
        )}

        {/* Important Instructions */}
        <div className="bg-gray-50 p-8 rounded-lg my-2">
          <h3 className="text-xl font-semibold mb-3">
            Important Instructions:
          </h3>
          <ul className="list-decimal pl-6 space-y-2 text-gray-700 text-lg">
            <li>
              Your Time Countdown Will begin as soon as you click the 'Begin
              Test' Button.
            </li>
            <li>You cannot pause the test once started.</li>
            <li>All questions are mandatory to attempt.</li>
            <li>Negative marking will be applied for wrong answers.</li>
          </ul>
        </div>

        {/* Begin Test Button */}
        <div className="flex justify-center">
          <button
            onClick={handleBeginTest}
            disabled={!selectedSkill}
            className="bg-custom-purple text-white font-bold py-4 px-8 rounded-lg text-xl flex items-center gap-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <FaPlay /> Begin Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillTest;
