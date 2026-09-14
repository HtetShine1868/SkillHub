"""Generate a clean UML use-case diagram SVG for SkillHub."""
from pathlib import Path

W, H = 1680, 1080
OUT = Path(__file__).with_name("use-case-diagram.svg")


def ellipse(cx, cy, rx, ry, lines):
    if len(lines) == 1:
        texts = f'<text x="{cx}" y="{cy + 4}" text-anchor="middle">{lines[0]}</text>'
    else:
        texts = (
            f'<text x="{cx}" y="{cy - 5}" text-anchor="middle">{lines[0]}</text>'
            f'<text x="{cx}" y="{cy + 12}" text-anchor="middle">{lines[1]}</text>'
        )
    return (
        f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" '
        f'fill="#fefce8" stroke="#1a365d" stroke-width="1.6"/>{texts}'
    )


def actor(cx, cy, name, sub=""):
    body_bot = cy + 66
    arms_y = cy + 34
    parts = [
        f'<circle cx="{cx}" cy="{cy}" r="14"/>',
        f'<line x1="{cx}" y1="{cy + 14}" x2="{cx}" y2="{body_bot}"/>',
        f'<line x1="{cx - 26}" y1="{arms_y}" x2="{cx + 26}" y2="{arms_y}"/>',
        f'<line x1="{cx}" y1="{body_bot}" x2="{cx - 20}" y2="{body_bot + 36}"/>',
        f'<line x1="{cx}" y1="{body_bot}" x2="{cx + 20}" y2="{body_bot + 36}"/>',
        (
            f'<text x="{cx}" y="{body_bot + 54}" text-anchor="middle" stroke="none" '
            f'fill="#1a202c" font-weight="600" font-size="14">{name}</text>'
        ),
    ]
    if sub:
        parts.append(
            f'<text x="{cx}" y="{body_bot + 70}" text-anchor="middle" stroke="none" '
            f'fill="#64748b" font-size="11">{sub}</text>'
        )
    return (
        f'<g fill="none" stroke="#1a202c" stroke-width="2" '
        f'font-family="Segoe UI, Arial, sans-serif">{"".join(parts)}</g>'
    )


def assoc(x1, y1, x2, y2):
    return (
        f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" '
        f'stroke="#1a202c" stroke-width="1.12"/>'
    )


def rel(x1, y1, x2, y2, label, lx, ly):
    return (
        f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#64748b" '
        f'stroke-width="1.15" stroke-dasharray="5 3" marker-end="url(#arrow)"/>'
        f'<text x="{lx}" y="{ly}" font-size="10" fill="#64748b" font-style="italic" '
        f'font-family="Segoe UI, Arial, sans-serif">{label}</text>'
    )


# name -> (cx, cy, rx, ry, lines)
UC = {
    "register": (850, 148, 118, 28, ["Register Account"]),
    "login": (850, 208, 100, 26, ["Login"]),
    "profile": (850, 266, 110, 26, ["Manage Profile"]),
    "discover": (470, 340, 122, 32, ["Discover / Select Career"]),
    "assess": (470, 412, 122, 32, ["Take Skill Assessment"]),
    "roadmap": (470, 486, 128, 34, ["View Personalized", "Roadmap"]),
    "enroll": (470, 568, 118, 28, ["Enroll in Course"]),
    "study": (470, 636, 110, 28, ["Study Lessons"]),
    "ai": (470, 706, 122, 32, ["Use AI Learning", "Assistant"]),
    "progress": (470, 776, 122, 28, ["Track Learning Progress"]),
    "review": (470, 844, 122, 32, ["Rate and Review Course"]),
    "certs": (470, 914, 122, 32, ["View Certificates", "and Badges"]),
    "chat": (470, 984, 118, 28, ["Chat with Instructor"]),
    "exchange": (470, 1048, 118, 28, ["Join Skill Exchange"]),
    "create": (1230, 340, 122, 32, ["Create / Edit Courses"]),
    "content": (1230, 412, 122, 32, ["Manage Lessons", "and Content"]),
    "submit": (1230, 486, 122, 34, ["Submit Course", "for Approval"]),
    "ianalytics": (1230, 560, 122, 32, ["View Course Analytics"]),
    "users": (1230, 655, 110, 28, ["Manage Users"]),
    "skills": (1230, 722, 122, 32, ["Manage Skills", "and Careers"]),
    "questions": (1230, 792, 122, 32, ["Manage Assessment", "Questions"]),
    "approve": (1230, 862, 122, 32, ["Approve / Reject", "Courses"]),
    "moderate": (1230, 932, 122, 32, ["Moderate Reviews", "and Projects"]),
    "sanalytics": (1230, 1002, 122, 32, ["View Platform", "Analytics"]),
}

student = (90, 520)
instructor = (1590, 250)
admin = (1590, 780)
ai_tutor = (90, 730)


def left(name):
    cx, cy, rx, *_ = UC[name]
    return cx - rx, cy


def right(name):
    cx, cy, rx, *_ = UC[name]
    return cx + rx, cy


def top(name):
    cx, cy, rx, ry, _ = UC[name]
    return cx, cy - ry


def bottom(name):
    cx, cy, rx, ry, _ = UC[name]
    return cx, cy + ry


svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <rect width="{W}" height="{H}" fill="#ffffff"/>
  <text x="{W/2}" y="34" text-anchor="middle" font-family="Georgia, Times New Roman, serif"
        font-size="24" font-weight="bold" fill="#1a202c">SkillHub Use Case Diagram</text>
  <rect x="250" y="52" width="1180" height="1014" fill="#ffffff" stroke="#1a365d" stroke-width="2.2"/>
  <text x="840" y="76" text-anchor="middle" font-family="Georgia, Times New Roman, serif"
        font-size="16" font-weight="bold" fill="#1a365d">SkillHub</text>
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b"/>
    </marker>
  </defs>

  <rect x="310" y="292" width="330" height="760" fill="#f8fafc" stroke="#94a3b8"
        stroke-width="1" stroke-dasharray="5 4" rx="6"/>
  <text x="324" y="310" font-family="Segoe UI, Arial, sans-serif" font-size="11"
        font-weight="600" fill="#475569">Career &amp; Learning</text>

  <rect x="1070" y="292" width="330" height="292" fill="#f8fafc" stroke="#94a3b8"
        stroke-width="1" stroke-dasharray="5 4" rx="6"/>
  <text x="1084" y="310" font-family="Segoe UI, Arial, sans-serif" font-size="11"
        font-weight="600" fill="#475569">Course Authoring</text>

  <rect x="1070" y="604" width="330" height="448" fill="#f8fafc" stroke="#94a3b8"
        stroke-width="1" stroke-dasharray="5 4" rx="6"/>
  <text x="1084" y="622" font-family="Segoe UI, Arial, sans-serif" font-size="11"
        font-weight="600" fill="#475569">Administration</text>

  <g font-family="Segoe UI, Arial, sans-serif" font-size="12.2" fill="#1a202c">
    {''.join(ellipse(*UC[k]) for k in UC)}
  </g>
'''

# Student associations
s_x, s_y = student[0] + 28, student[1] + 34
for name in [
    "register", "login", "profile", "discover", "assess", "roadmap", "enroll",
    "study", "ai", "progress", "review", "certs", "chat", "exchange",
]:
    svg += assoc(s_x, s_y, *left(name))

# Instructor
i_x, i_y = instructor[0] - 28, instructor[1] + 34
for name in ["register", "login", "profile", "create", "content", "submit", "ianalytics", "chat"]:
    svg += assoc(i_x, i_y, *right(name) if name not in ("chat",) else (UC["chat"][0] + UC["chat"][2], UC["chat"][1]))
# chat is on the left; instructor line should go to its right edge
# already handled

# Admin
a_x, a_y = admin[0] - 28, admin[1] + 34
for name in ["login", "users", "skills", "questions", "approve", "moderate", "sanalytics"]:
    svg += assoc(a_x, a_y, *right(name) if name != "login" else (UC["login"][0] + UC["login"][2], UC["login"][1] + 6))

# AI
ai_x, ai_y = ai_tutor[0] + 28, ai_tutor[1] + 34
svg += assoc(ai_x, ai_y, *left("ai"))

# include / extend
svg += rel(*top("roadmap"), *bottom("discover"), "&lt;&lt;include&gt;&gt;", 502, 388)
svg += rel(UC["roadmap"][0] + 24, UC["roadmap"][1] - 34, UC["assess"][0] + 24, UC["assess"][1] + 32, "&lt;&lt;include&gt;&gt;", 522, 448)
svg += rel(*top("ai"), *bottom("study"), "&lt;&lt;extend&gt;&gt;", 502, 670)
svg += rel(UC["certs"][0] + 70, UC["certs"][1], UC["enroll"][0] + 118, UC["enroll"][1] + 8, "&lt;&lt;extend&gt;&gt;", 610, 740)
svg += rel(UC["review"][0] + 122, UC["review"][1], UC["enroll"][0] + 118, UC["enroll"][1] + 16, "&lt;&lt;extend&gt;&gt;", 610, 800)
svg += rel(*top("submit"), *bottom("create"), "&lt;&lt;include&gt;&gt;", 1252, 388)
svg += rel(*bottom("create"), *top("content"), "&lt;&lt;include&gt;&gt;", 1252, 376)
svg += rel(UC["approve"][0] - 50, UC["approve"][1] - 32, UC["submit"][0] - 50, UC["submit"][1] + 34, "&lt;&lt;include&gt;&gt;", 1148, 680)

svg += actor(student[0], student[1], "Student")
svg += actor(instructor[0], instructor[1], "Instructor")
svg += actor(admin[0], admin[1], "Admin")
svg += actor(ai_tutor[0], ai_tutor[1], "AI Tutor", "(Gemini)")

svg += """
</svg>
"""

OUT.write_text(svg, encoding="utf-8")
print(f"Wrote {OUT} ({len(svg)} chars)")
