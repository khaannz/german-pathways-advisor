import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType } from 'docx';
import jsPDF from 'jspdf';

// Universal download helper function
const downloadBlob = (blob: Blob, filename: string): void => {
  try {
    // Method 1: Create URL and download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error('Download failed:', error);
    // Fallback: Open in new tab
    try {
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (fallbackError) {
      console.error('Fallback download also failed:', fallbackError);
      throw new Error('Download failed. Please try again or check your browser settings.');
    }
  }
};

// Type definitions based on exact database schema
export interface CVResponse {
  id: string;
  user_id: string;
  summary?: string;
  education_history?: string;
  work_experience?: string;
  technical_skills?: string;
  soft_skills?: string;
  languages?: string;
  certifications?: string;
  extracurriculars?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CVEducationEntry {
  id: string;
  cv_response_id: string;
  user_id: string;
  institution: string;
  program: string;
  start_date: string;
  end_date?: string;
  gpa?: string;
  achievements?: string;
  created_at: string;
  updated_at: string;
}

export interface CVWorkExperienceEntry {
  id: string;
  cv_response_id: string;
  user_id: string;
  company: string;
  position: string;
  start_date: string;
  end_date?: string;
  description?: string;
  technologies?: string;
  achievements?: string;
  created_at: string;
  updated_at: string;
}

export interface SOPResponse {
  id: string;
  user_id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  nationality?: string;
  date_of_birth?: string;
  linked_in?: string;
  current_education_status?: string;
  intended_program?: string;
  target_universities?: string;
  why_this_program?: string;
  why_germany?: string;
  short_term_goals?: string;
  long_term_goals?: string;
  has_thesis?: boolean;
  thesis_details?: string;
  academic_projects?: string;
  work_experience?: string;
  personal_qualities?: string;
  challenges_accomplishments?: string;
  research_interests?: string;
  language_proficiency?: string;
  financial_planning?: string;
  created_at: string;
  updated_at: string;
}

export interface LORResponse {
  id: string;
  user_id: string;
  recommender_name?: string;
  recommender_designation?: string;
  recommender_institution?: string;
  recommender_email?: string;
  recommender_phone?: string;
  relationship_type?: string;
  relationship_duration?: string;
  courses_projects?: string;
  key_strengths?: string;
  specific_examples?: string;
  grades_performance?: string;
  research_experience?: string;
  leadership_roles?: string;
  communication_skills?: string;
  recommendation_strength?: 'strong' | 'moderate' | 'weak';
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  phone?: string;
  target_program?: string;
  target_university?: string;
  consultation_status?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface CompleteCVData {
  cvResponse: CVResponse;
  profile: UserProfile;
  educationEntries: CVEducationEntry[];
  workExperienceEntries: CVWorkExperienceEntry[];
}

export interface CompleteSOPData {
  sopResponse: SOPResponse;
  profile: UserProfile;
}

export interface CompleteLORData {
  lorResponse: LORResponse;
  profile: UserProfile;
}

export const generateCVWordDocument = async (data: CompleteCVData, userName: string) => {
  const { cvResponse, profile, educationEntries, workExperienceEntries } = data;
  
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Header
        new Paragraph({
          children: [
            new TextRun({
              text: `Curriculum Vitae - ${userName}`,
              bold: true,
              size: 32,
              color: "262374"
            })
          ],
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),

        // Generated date
        new Paragraph({
          children: [
            new TextRun({
              text: `Generated on: ${new Date().toLocaleDateString()}`,
              italics: true,
              size: 20
            })
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { after: 300 }
        }),

        // Personal Information Section
        new Paragraph({
          children: [
            new TextRun({
              text: "Personal Information",
              bold: true,
              size: 24,
              color: "262374"
            })
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 200 }
        }),

        // Personal Information Table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Full Name:", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: profile.full_name || "Not provided" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Phone:", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: profile.phone || "Not provided" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Target Program:", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: profile.target_program || "Not provided" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Target University:", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: profile.target_university || "Not provided" })] })] })
              ]
            })
          ]
        }),

        // Professional Summary
        new Paragraph({
          children: [
            new TextRun({
              text: "Professional Summary",
              bold: true,
              size: 24,
              color: "262374"
            })
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: cvResponse.summary || "Not provided",
              size: 22
            })
          ],
          spacing: { after: 300 }
        }),

        // Education History
        new Paragraph({
          children: [
            new TextRun({
              text: "Education History",
              bold: true,
              size: 24,
              color: "262374"
            })
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 200 }
        }),

        // Education Entries Table
        ...(educationEntries.length > 0 ? [
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Institution", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Program", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Duration", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "GPA", bold: true })] })] })
                ]
              }),
              ...educationEntries.map(entry => new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: entry.institution })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: entry.program })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${entry.start_date} - ${entry.end_date || 'Present'}` })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: entry.gpa || 'N/A' })] })] })
                ]
              }))
            ]
          })
        ] : [
          new Paragraph({
            children: [
              new TextRun({
                text: cvResponse.education_history || "Not provided",
                size: 22
              })
            ],
            spacing: { after: 300 }
          })
        ]),

        // Work Experience
        new Paragraph({
          children: [
            new TextRun({
              text: "Work Experience",
              bold: true,
              size: 24,
              color: "262374"
            })
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 200 }
        }),

        // Work Experience Entries
        ...(workExperienceEntries.length > 0 ? 
          workExperienceEntries.flatMap(entry => [
            new Paragraph({
              children: [
                new TextRun({
                  text: `${entry.position} at ${entry.company}`,
                  bold: true,
                  size: 22
                })
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Duration: ${entry.start_date} - ${entry.end_date || 'Present'}`,
                  size: 20
                })
              ],
              spacing: { after: 100 }
            }),
            ...(entry.description ? [new Paragraph({
              children: [
                new TextRun({
                  text: entry.description,
                  size: 20
                })
              ],
              spacing: { after: 100 }
            })] : []),
            ...(entry.technologies ? [new Paragraph({
              children: [
                new TextRun({
                  text: `Technologies: ${entry.technologies}`,
                  size: 20
                })
              ],
              spacing: { after: 100 }
            })] : []),
            ...(entry.achievements ? [new Paragraph({
              children: [
                new TextRun({
                  text: `Achievements: ${entry.achievements}`,
                  size: 20
                })
              ],
              spacing: { after: 200 }
            })] : [])
          ]) : [
            new Paragraph({
              children: [
                new TextRun({
                  text: cvResponse.work_experience || "Not provided",
                  size: 22
                })
              ],
              spacing: { after: 300 }
            })
          ]
        ),

        // Technical Skills
        new Paragraph({
          children: [
            new TextRun({
              text: "Technical Skills",
              bold: true,
              size: 24,
              color: "262374"
            })
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: cvResponse.technical_skills || "Not provided",
              size: 22
            })
          ],
          spacing: { after: 300 }
        }),

        // Soft Skills
        new Paragraph({
          children: [
            new TextRun({
              text: "Soft Skills",
              bold: true,
              size: 24,
              color: "262374"
            })
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: cvResponse.soft_skills || "Not provided",
              size: 22
            })
          ],
          spacing: { after: 300 }
        }),

        // Certifications
        new Paragraph({
          children: [
            new TextRun({
              text: "Certifications",
              bold: true,
              size: 24,
              color: "262374"
            })
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: cvResponse.certifications || "Not provided",
              size: 22
            })
          ],
          spacing: { after: 300 }
        }),

        // Languages
        new Paragraph({
          children: [
            new TextRun({
              text: "Languages",
              bold: true,
              size: 24,
              color: "262374"
            })
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: cvResponse.languages || "Not provided",
              size: 22
            })
          ],
          spacing: { after: 300 }
        }),

        // Extracurricular Activities
        new Paragraph({
          children: [
            new TextRun({
              text: "Extracurricular Activities",
              bold: true,
              size: 24,
              color: "262374"
            })
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: cvResponse.extracurriculars || "Not provided",
              size: 22
            })
          ],
          spacing: { after: 300 }
        })
      ]
    }]
  });

  try {
    const blob = await Packer.toBlob(doc);
    const filename = `CV_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`;
    downloadBlob(blob, filename);
    return { success: true };
  } catch (error) {
    console.error('Error generating Word document:', error);
    throw new Error('Failed to generate Word document');
  }
};

export const generateSOPWordDocument = async (data: CompleteSOPData, userName: string) => {
  const { sopResponse, profile } = data;
  
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Header
        new Paragraph({
          children: [
            new TextRun({
              text: `Statement of Purpose - ${userName}`,
              bold: true,
              size: 32,
              color: "262374"
            })
          ],
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),

        // Generated date
        new Paragraph({
          children: [
            new TextRun({
              text: `Generated on: ${new Date().toLocaleDateString()}`,
              italics: true,
              size: 20
            })
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { after: 300 }
        }),

        // Personal Information Section
        new Paragraph({
          children: [
            new TextRun({
              text: "Personal Information",
              bold: true,
              size: 24,
              color: "262374"
            })
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 200 }
        }),

        // Personal Information Table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Full Name:", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: sopResponse.full_name || profile.full_name || "Not provided" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Email:", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: sopResponse.email || "Not provided" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Phone:", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: sopResponse.phone || profile.phone || "Not provided" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Nationality:", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: sopResponse.nationality || "Not provided" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Date of Birth:", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: sopResponse.date_of_birth || "Not provided" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "LinkedIn:", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: sopResponse.linked_in || "Not provided" })] })] })
              ]
            })
          ]
        }),

        // Academic Background
        new Paragraph({
          children: [
            new TextRun({
              text: "Academic Background",
              bold: true,
              size: 24,
              color: "262374"
            })
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Current Education Status: ",
              bold: true,
              size: 22
            }),
            new TextRun({
              text: sopResponse.current_education_status || "Not provided",
              size: 22
            })
          ],
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Intended Program: ",
              bold: true,
              size: 22
            }),
            new TextRun({
              text: sopResponse.intended_program || profile.target_program || "Not provided",
              size: 22
            })
          ],
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Target Universities: ",
              bold: true,
              size: 22
            }),
            new TextRun({
              text: sopResponse.target_universities || profile.target_university || "Not provided",
              size: 22
            })
          ],
          spacing: { after: 300 }
        }),

        // Motivation and Goals
        new Paragraph({
          children: [
            new TextRun({
              text: "Motivation and Goals",
              bold: true,
              size: 24,
              color: "262374"
            })
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Why This Program:",
              bold: true,
              size: 22
            })
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: sopResponse.why_this_program || "Not provided",
              size: 22
            })
          ],
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Why Germany:",
              bold: true,
              size: 22
            })
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: sopResponse.why_germany || "Not provided",
              size: 22
            })
          ],
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Short-term Goals:",
              bold: true,
              size: 22
            })
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: sopResponse.short_term_goals || "Not provided",
              size: 22
            })
          ],
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Long-term Goals:",
              bold: true,
              size: 22
            })
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: sopResponse.long_term_goals || "Not provided",
              size: 22
            })
          ],
          spacing: { after: 300 }
        }),

        // Research and Academic Experience
        new Paragraph({
          children: [
            new TextRun({
              text: "Research and Academic Experience",
              bold: true,
              size: 24,
              color: "262374"
            })
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Has Thesis: ",
              bold: true,
              size: 22
            }),
            new TextRun({
              text: sopResponse.has_thesis ? "Yes" : "No",
              size: 22
            })
          ],
          spacing: { after: 200 }
        }),
        ...(sopResponse.has_thesis && sopResponse.thesis_details ? [
          new Paragraph({
            children: [
              new TextRun({
                text: "Thesis Details:",
                bold: true,
                size: 22
              })
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: sopResponse.thesis_details,
                size: 22
              })
            ],
            spacing: { after: 200 }
          })
        ] : []),
        new Paragraph({
          children: [
            new TextRun({
              text: "Academic Projects:",
              bold: true,
              size: 22
            })
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: sopResponse.academic_projects || "Not provided",
              size: 22
            })
          ],
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Research Interests:",
              bold: true,
              size: 22
            })
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: sopResponse.research_interests || "Not provided",
              size: 22
            })
          ],
          spacing: { after: 300 }
        }),

        // Professional Experience
        new Paragraph({
          children: [
            new TextRun({
              text: "Professional Experience",
              bold: true,
              size: 24,
              color: "262374"
            })
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: sopResponse.work_experience || "Not provided",
              size: 22
            })
          ],
          spacing: { after: 300 }
        }),

        // Personal Qualities and Achievements
        new Paragraph({
          children: [
            new TextRun({
              text: "Personal Qualities and Achievements",
              bold: true,
              size: 24,
              color: "262374"
            })
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Personal Qualities:",
              bold: true,
              size: 22
            })
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: sopResponse.personal_qualities || "Not provided",
              size: 22
            })
          ],
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Challenges and Accomplishments:",
              bold: true,
              size: 22
            })
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: sopResponse.challenges_accomplishments || "Not provided",
              size: 22
            })
          ],
          spacing: { after: 300 }
        }),

        // Additional Information
        new Paragraph({
          children: [
            new TextRun({
              text: "Additional Information",
              bold: true,
              size: 24,
              color: "262374"
            })
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Language Proficiency:",
              bold: true,
              size: 22
            })
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: sopResponse.language_proficiency || "Not provided",
              size: 22
            })
          ],
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Financial Planning:",
              bold: true,
              size: 22
            })
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: sopResponse.financial_planning || "Not provided",
              size: 22
            })
          ],
          spacing: { after: 300 }
        })
      ]
    }]
  });

  try {
    const blob = await Packer.toBlob(doc);
    const filename = `SOP_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`;
    downloadBlob(blob, filename);
    return { success: true };
  } catch (error) {
    console.error('Error generating Word document:', error);
    throw new Error('Failed to generate Word document');
  }
};

export const generateLORWordDocument = async (data: CompleteLORData, userName: string) => {
  const { lorResponse, profile } = data;
  
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Header
        new Paragraph({
          children: [
            new TextRun({
              text: `Letter of Recommendation - ${userName}`,
              bold: true,
              size: 32,
              color: "262374"
            })
          ],
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),

        // Generated date
        new Paragraph({
          children: [
            new TextRun({
              text: `Generated on: ${new Date().toLocaleDateString()}`,
              italics: true,
              size: 20
            })
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { after: 300 }
        }),

        // Student Information Section
        new Paragraph({
          children: [
            new TextRun({
              text: "Student Information",
              bold: true,
              size: 24,
              color: "262374"
            })
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 200 }
        }),

        // Student Information Table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Full Name:", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: profile.full_name || "Not provided" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Phone:", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: profile.phone || "Not provided" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Target Program:", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: profile.target_program || "Not provided" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Target University:", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: profile.target_university || "Not provided" })] })] })
              ]
            })
          ]
        }),

        // Recommender Information
        new Paragraph({
          children: [
            new TextRun({
              text: "Recommender Information",
              bold: true,
              size: 24,
              color: "262374"
            })
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        }),

        // Recommender Information Table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Name:", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: lorResponse.recommender_name || "Not provided" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Designation:", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: lorResponse.recommender_designation || "Not provided" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Institution:", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: lorResponse.recommender_institution || "Not provided" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Email:", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: lorResponse.recommender_email || "Not provided" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Phone:", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: lorResponse.recommender_phone || "Not provided" })] })] })
              ]
            })
          ]
        }),

        // Relationship Context
        new Paragraph({
          children: [
            new TextRun({
              text: "Relationship Context",
              bold: true,
              size: 24,
              color: "262374"
            })
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Relationship Type: ",
              bold: true,
              size: 22
            }),
            new TextRun({
              text: lorResponse.relationship_type || "Not provided",
              size: 22
            })
          ],
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Relationship Duration: ",
              bold: true,
              size: 22
            }),
            new TextRun({
              text: lorResponse.relationship_duration || "Not provided",
              size: 22
            })
          ],
          spacing: { after: 300 }
        }),

        // Academic Assessment
        new Paragraph({
          children: [
            new TextRun({
              text: "Academic Assessment",
              bold: true,
              size: 24,
              color: "262374"
            })
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Courses and Projects:",
              bold: true,
              size: 22
            })
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: lorResponse.courses_projects || "Not provided",
              size: 22
            })
          ],
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Grades and Performance:",
              bold: true,
              size: 22
            })
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: lorResponse.grades_performance || "Not provided",
              size: 22
            })
          ],
          spacing: { after: 300 }
        }),

        // Skills and Qualities
        new Paragraph({
          children: [
            new TextRun({
              text: "Skills and Qualities",
              bold: true,
              size: 24,
              color: "262374"
            })
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Key Strengths:",
              bold: true,
              size: 22
            })
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: lorResponse.key_strengths || "Not provided",
              size: 22
            })
          ],
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Specific Examples:",
              bold: true,
              size: 22
            })
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: lorResponse.specific_examples || "Not provided",
              size: 22
            })
          ],
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Research Experience:",
              bold: true,
              size: 22
            })
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: lorResponse.research_experience || "Not provided",
              size: 22
            })
          ],
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Leadership Roles:",
              bold: true,
              size: 22
            })
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: lorResponse.leadership_roles || "Not provided",
              size: 22
            })
          ],
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Communication Skills:",
              bold: true,
              size: 22
            })
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: lorResponse.communication_skills || "Not provided",
              size: 22
            })
          ],
          spacing: { after: 300 }
        }),

        // Recommendation Strength
        new Paragraph({
          children: [
            new TextRun({
              text: "Recommendation",
              bold: true,
              size: 24,
              color: "262374"
            })
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Recommendation Strength: ",
              bold: true,
              size: 22
            }),
            new TextRun({
              text: lorResponse.recommendation_strength ? lorResponse.recommendation_strength.toUpperCase() : "Not provided",
              size: 22
            })
          ],
          spacing: { after: 300 }
        })
      ]
    }]
  });

  try {
    const blob = await Packer.toBlob(doc);
    const filename = `LOR_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`;
    downloadBlob(blob, filename);
    return { success: true };
  } catch (error) {
    console.error('Error generating Word document:', error);
    throw new Error('Failed to generate Word document');
  }
};

// PDF Generation Functions
export const generateCVPDF = (data: CompleteCVData, userName: string) => {
  const { cvResponse, profile, educationEntries, workExperienceEntries } = data;
  
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Helper function to add text with automatic page break
  const addText = (text: string, x: number, y: number, fontSize: number = 10, fontWeight: string = 'normal') => {
    if (y > pageHeight - 20) {
      pdf.addPage();
      y = 20;
    }

    pdf.setFontSize(fontSize);
    if (fontWeight === 'bold') {
      pdf.setFont(undefined, 'bold');
    } else {
      pdf.setFont(undefined, 'normal');
    }

    const maxWidth = pageWidth - 40;
    const lines = pdf.splitTextToSize(text, maxWidth);

    for (let i = 0; i < lines.length; i++) {
      if (y > pageHeight - 20) {
        pdf.addPage();
        y = 20;
      }
      pdf.text(lines[i], x, y);
      y += fontSize * 0.5;
    }

    return y + 5;
  };

  // Title
  yPosition = addText(`Curriculum Vitae - ${userName}`, 20, yPosition, 20, 'bold');
  yPosition = addText(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition, 10);
  yPosition += 10;

  // Personal Information
  yPosition = addText('Personal Information', 20, yPosition, 16, 'bold');
  yPosition = addText(`Full Name: ${profile.full_name || 'Not provided'}`, 20, yPosition);
  yPosition = addText(`Phone: ${profile.phone || 'Not provided'}`, 20, yPosition);
  yPosition = addText(`Target Program: ${profile.target_program || 'Not provided'}`, 20, yPosition);
  yPosition = addText(`Target University: ${profile.target_university || 'Not provided'}`, 20, yPosition);
  yPosition += 10;

  // Professional Summary
  yPosition = addText('Professional Summary', 20, yPosition, 16, 'bold');
  yPosition = addText(cvResponse.summary || 'Not provided', 20, yPosition);
  yPosition += 10;

  // Education
  yPosition = addText('Education History', 20, yPosition, 16, 'bold');
  if (educationEntries.length > 0) {
    educationEntries.forEach(entry => {
      yPosition = addText(`${entry.institution} - ${entry.program}`, 20, yPosition, 12, 'bold');
      yPosition = addText(`Duration: ${entry.start_date} - ${entry.end_date || 'Present'}`, 20, yPosition);
      if (entry.gpa) yPosition = addText(`GPA: ${entry.gpa}`, 20, yPosition);
      if (entry.achievements) yPosition = addText(`Achievements: ${entry.achievements}`, 20, yPosition);
      yPosition += 5;
    });
  } else {
    yPosition = addText(cvResponse.education_history || 'Not provided', 20, yPosition);
  }
  yPosition += 10;

  // Work Experience
  yPosition = addText('Work Experience', 20, yPosition, 16, 'bold');
  if (workExperienceEntries.length > 0) {
    workExperienceEntries.forEach(entry => {
      yPosition = addText(`${entry.position} at ${entry.company}`, 20, yPosition, 12, 'bold');
      yPosition = addText(`Duration: ${entry.start_date} - ${entry.end_date || 'Present'}`, 20, yPosition);
      if (entry.description) yPosition = addText(entry.description, 20, yPosition);
      if (entry.technologies) yPosition = addText(`Technologies: ${entry.technologies}`, 20, yPosition);
      if (entry.achievements) yPosition = addText(`Achievements: ${entry.achievements}`, 20, yPosition);
      yPosition += 5;
    });
  } else {
    yPosition = addText(cvResponse.work_experience || 'Not provided', 20, yPosition);
  }
  yPosition += 10;

  // Skills
  yPosition = addText('Technical Skills', 20, yPosition, 16, 'bold');
  yPosition = addText(cvResponse.technical_skills || 'Not provided', 20, yPosition);
  yPosition += 10;

  yPosition = addText('Soft Skills', 20, yPosition, 16, 'bold');
  yPosition = addText(cvResponse.soft_skills || 'Not provided', 20, yPosition);
  yPosition += 10;

  // Other sections
  yPosition = addText('Certifications', 20, yPosition, 16, 'bold');
  yPosition = addText(cvResponse.certifications || 'Not provided', 20, yPosition);
  yPosition += 10;

  yPosition = addText('Languages', 20, yPosition, 16, 'bold');
  yPosition = addText(cvResponse.languages || 'Not provided', 20, yPosition);
  yPosition += 10;

  yPosition = addText('Extracurricular Activities', 20, yPosition, 16, 'bold');
  yPosition = addText(cvResponse.extracurriculars || 'Not provided', 20, yPosition);

  pdf.save(`CV_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateSOPPDF = (data: CompleteSOPData, userName: string) => {
  const { sopResponse, profile } = data;
  
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Helper function to add text with automatic page break
  const addText = (text: string, x: number, y: number, fontSize: number = 10, fontWeight: string = 'normal') => {
    if (y > pageHeight - 20) {
      pdf.addPage();
      y = 20;
    }

    pdf.setFontSize(fontSize);
    if (fontWeight === 'bold') {
      pdf.setFont(undefined, 'bold');
    } else {
      pdf.setFont(undefined, 'normal');
    }

    const maxWidth = pageWidth - 40;
    const lines = pdf.splitTextToSize(text, maxWidth);

    for (let i = 0; i < lines.length; i++) {
      if (y > pageHeight - 20) {
        pdf.addPage();
        y = 20;
      }
      pdf.text(lines[i], x, y);
      y += fontSize * 0.5;
    }

    return y + 5;
  };

  // Title
  yPosition = addText(`Statement of Purpose - ${userName}`, 20, yPosition, 20, 'bold');
  yPosition = addText(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition, 10);
  yPosition += 10;

  // Personal Information
  yPosition = addText('Personal Information', 20, yPosition, 16, 'bold');
  yPosition = addText(`Full Name: ${sopResponse.full_name || profile.full_name || 'Not provided'}`, 20, yPosition);
  yPosition = addText(`Email: ${sopResponse.email || 'Not provided'}`, 20, yPosition);
  yPosition = addText(`Phone: ${sopResponse.phone || profile.phone || 'Not provided'}`, 20, yPosition);
  yPosition = addText(`Nationality: ${sopResponse.nationality || 'Not provided'}`, 20, yPosition);
  yPosition = addText(`Date of Birth: ${sopResponse.date_of_birth || 'Not provided'}`, 20, yPosition);
  yPosition = addText(`LinkedIn: ${sopResponse.linked_in || 'Not provided'}`, 20, yPosition);
  yPosition += 10;

  // Academic Background
  yPosition = addText('Academic Background', 20, yPosition, 16, 'bold');
  yPosition = addText(`Current Education Status: ${sopResponse.current_education_status || 'Not provided'}`, 20, yPosition);
  yPosition = addText(`Intended Program: ${sopResponse.intended_program || profile.target_program || 'Not provided'}`, 20, yPosition);
  yPosition = addText(`Target Universities: ${sopResponse.target_universities || profile.target_university || 'Not provided'}`, 20, yPosition);
  yPosition += 10;

  // Continue with other sections...
  yPosition = addText('Why This Program:', 20, yPosition, 12, 'bold');
  yPosition = addText(sopResponse.why_this_program || 'Not provided', 20, yPosition);
  yPosition += 10;

  yPosition = addText('Why Germany:', 20, yPosition, 12, 'bold');
  yPosition = addText(sopResponse.why_germany || 'Not provided', 20, yPosition);
  yPosition += 10;

  // Add remaining sections similarly...

  pdf.save(`SOP_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateLORPDF = (data: CompleteLORData, userName: string) => {
  const { lorResponse, profile } = data;
  
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Helper function to add text with automatic page break
  const addText = (text: string, x: number, y: number, fontSize: number = 10, fontWeight: string = 'normal') => {
    if (y > pageHeight - 20) {
      pdf.addPage();
      y = 20;
    }

    pdf.setFontSize(fontSize);
    if (fontWeight === 'bold') {
      pdf.setFont(undefined, 'bold');
    } else {
      pdf.setFont(undefined, 'normal');
    }

    const maxWidth = pageWidth - 40;
    const lines = pdf.splitTextToSize(text, maxWidth);

    for (let i = 0; i < lines.length; i++) {
      if (y > pageHeight - 20) {
        pdf.addPage();
        y = 20;
      }
      pdf.text(lines[i], x, y);
      y += fontSize * 0.5;
    }

    return y + 5;
  };

  // Title
  yPosition = addText(`Letter of Recommendation - ${userName}`, 20, yPosition, 20, 'bold');
  yPosition = addText(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition, 10);
  yPosition += 10;

  // Student Information
  yPosition = addText('Student Information', 20, yPosition, 16, 'bold');
  yPosition = addText(`Full Name: ${profile.full_name || 'Not provided'}`, 20, yPosition);
  yPosition = addText(`Phone: ${profile.phone || 'Not provided'}`, 20, yPosition);
  yPosition = addText(`Target Program: ${profile.target_program || 'Not provided'}`, 20, yPosition);
  yPosition += 10;

  // Recommender Information
  yPosition = addText('Recommender Information', 20, yPosition, 16, 'bold');
  yPosition = addText(`Name: ${lorResponse.recommender_name || 'Not provided'}`, 20, yPosition);
  yPosition = addText(`Designation: ${lorResponse.recommender_designation || 'Not provided'}`, 20, yPosition);
  yPosition = addText(`Institution: ${lorResponse.recommender_institution || 'Not provided'}`, 20, yPosition);
  yPosition = addText(`Email: ${lorResponse.recommender_email || 'Not provided'}`, 20, yPosition);
  yPosition += 10;

  // Add remaining sections similarly...

  pdf.save(`LOR_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};