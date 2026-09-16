import fitz

pdf_path = r"C:\Users\Admin\.gemini\antigravity\brain\03754fc9-4e14-4052-8b78-e994f4637a55\.user_uploaded\media_1787844160787.pdf"
doc = fitz.open(pdf_path)

print("Page 0 lines:")
for l in doc[0].get_text("text").splitlines()[:15]:
    print(repr(l))

print("\nPage 1 lines:")
for l in doc[1].get_text("text").splitlines()[:15]:
    print(repr(l))
