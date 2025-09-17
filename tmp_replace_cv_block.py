from pathlib import Path

path = Path(r"c:\Users\abdul\OneDrive\Desktop\german-pathways-advisor\src\components\forms\CVFormEnhanced.tsx")
text = path.read_text()
old = "  return (\r\n      <Card className=\"border-green-200 bg-green-50\">\r\n        <CardHeader className=\"text-center\">\r\n          <div className=\"flex items-center justify-center mb-4\">\r\n            <div className=\"p-3 bg-green-100 rounded-full\">\r\n              <CheckCircle className=\"h-8 w-8 text-green-600\" />\r\n            </div>\r\n          </div>\r\n          <CardTitle className=\"text-green-800\">CV Form Submitted Successfully!</CardTitle>\r\n          <CardDescription className=\"text-green-700\">\r\n            Your CV information has been submitted and is being processed by our team.\r\n          </CardDescription>\r\n        </CardHeader>\r\n        <CardContent className=\"space-y-4\">\r\n          <div className=\"text-center\">\r\n            <p className=\"text-sm text-muted-foreground mb-4\">\r\n              Submitted on: {new Date(existingResponse.created_at).toLocaleDateString()}\r\n            </p>\r\n            \r\n            <div className=\"p-4 bg-green-50 border border-green-200 rounded-lg\">\r\n              <h4 className=\"font-medium text-green-800 mb-2\">Form Submitted Successfully</h4>\r\n              <p className=\"text-sm text-green-700\">\r\n                Thank you for submitting your CV information. Our team will review your details and get back to you soon.\r\n              </p>\r\n              {submissionDate && (\r\n                <p className=\"text-xs text-green-600 mt-2\">\r\n                  Submitted on: {new Date(submissionDate).toLocaleDateString()}\r\n                </p>\r\n              )}\r\n            </div>\r\n          </div>\r\n          \r\n          <div className=\"flex justify-center gap-4 pt-4 border-t\">\r\n            <Button \r\n              variant=\"outline\" \r\n              onClick={() => {\r\n                setIsSubmitted(false);\r\n                if (existingResponse) {\r\n                  loadExistingResponse();\r\n                }\r\n              }}\r\n              className=\"text-gray-600\"\r\n            >\r\n              Edit Submission\r\n            </Button>\r\n          </div>\r\n        </CardContent>\r\n      </Card>\r\n    );\r\n\r\n  return (\r\n    <Card>"
if old not in text:
    raise SystemExit('Old CV submitted block not found')
new = """  const lastSavedDisplay = formatTimestamp(lastSaved);
  const submissionDisplay = formatTimestamp(submissionDate);
  const lockedView = !isEmployee && isSubmitted;
  const isSaving = loading || uploading;

  if (lockedView) {
    return (
      <div className=\"space-y-6\">
        <Card>
          <CardHeader className=\"space-y-3\">
            <Badge variant=\"secondary\" className=\"w-fit\">Submission locked</Badge>
            <CardTitle className=\"text-2xl\">Your CV is locked</CardTitle>
            <CardDescription>
              Reach out to your advisor if you need to update any details. The summary below reflects your submitted CV.
            </CardDescription>
          </CardHeader>
        </Card>
        <CVResponseView refreshKey={viewRefresh} />
      </div>
    );
  }

  return (
    <Card>"""
text = text.replace(old, new)
path.write_text(text)
