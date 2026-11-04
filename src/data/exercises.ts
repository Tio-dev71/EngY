import type { DifficultyLevel, TrackType } from '@/types/database'

export type ExerciseType =
  | 'multiple_choice'
  | 'sentence_completion'
  | 'error_identification'
  | 'reading_cloze'
  | 'dialogue_matching'

export interface ExerciseItem {
  id: string
  track_type: TrackType
  category: string
  difficulty: DifficultyLevel
  type: ExerciseType
  title: string
  passage?: string // for cloze or reading context
  question_text: string
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[]
  correct_answer: 'A' | 'B' | 'C' | 'D'
  explanation_vi: string
  explanation_en?: string
  grammar_or_vocab_tag: string
  tip?: string
}

export const allExercises: ExerciseItem[] = [
  // ─────────────────────────────────────────────────────────────
  // TOEIC EXERCISES: PART 5 & GRAMMAR DRILLS
  // ─────────────────────────────────────────────────────────────
  {
    id: 'ex-toeic-01',
    track_type: 'toeic',
    category: 'Word Form & Parts of Speech',
    difficulty: 'beginner',
    type: 'multiple_choice',
    title: 'Từ loại: Tính từ đứng trước danh từ',
    question_text: 'The marketing team developed an _______ campaign to promote the newly released smartphone.',
    options: [
      { key: 'A', text: 'innovate' },
      { key: 'B', text: 'innovation' },
      { key: 'C', text: 'innovative' },
      { key: 'D', text: 'innovatively' },
    ],
    correct_answer: 'C',
    explanation_vi: 'Vị trí chỗ trống đứng sau mạo từ "an" và đứng trước danh từ "campaign", do đó cần một Tính từ (Adjective) để bổ nghĩa cho danh từ. "innovative" (mang tính đổi mới, sáng tạo) là tính từ.',
    grammar_or_vocab_tag: 'Adjective Position',
    tip: 'Mẹo: mạo từ (a/an/the) + [TÍNH TỪ] + danh từ.',
  },
  {
    id: 'ex-toeic-02',
    track_type: 'toeic',
    category: 'Subjunctive Mood',
    difficulty: 'advanced',
    type: 'multiple_choice',
    title: 'Thể giả định trong hợp đồng & nội quy',
    question_text: 'The quality auditor mandated that the chemical plant _______ all toxic emissions within 48 hours.',
    options: [
      { key: 'A', text: 'reduces' },
      { key: 'B', text: 'reduce' },
      { key: 'C', text: 'reduced' },
      { key: 'D', text: 'reducing' },
    ],
    correct_answer: 'B',
    explanation_vi: 'Cấu trúc thể giả định: S1 + mandated/demanded/insisted + that + S2 + (should) + V_bare (động từ nguyên thể không to). Dù "the chemical plant" là số ít, động từ vẫn giữ nguyên là "reduce".',
    grammar_or_vocab_tag: 'Subjunctive Mood',
    tip: 'Gặp các động từ yêu cầu (mandate, request, suggest, insist) + that -> luôn chọn động từ nguyên thể V_bare.',
  },
  {
    id: 'ex-toeic-03',
    track_type: 'toeic',
    category: 'Conjunctions vs Prepositions',
    difficulty: 'intermediate',
    type: 'multiple_choice',
    title: 'Phân biệt liên từ & giới từ chỉ nguyên nhân',
    question_text: '_______ unanticipated delays at customs, the consignment of electronic chips arrived two days behind schedule.',
    options: [
      { key: 'A', text: 'Because of' },
      { key: 'B', text: 'Because' },
      { key: 'C', text: 'Since' },
      { key: 'D', text: 'Even though' },
    ],
    correct_answer: 'A',
    explanation_vi: 'Sau chỗ trống là cụm danh từ "unanticipated delays at customs" (không có động từ chia thì). Do đó phải dùng giới từ "Because of" chỉ nguyên nhân. "Because" và "Since" là liên từ phải đi với mệnh đề (S + V).',
    grammar_or_vocab_tag: 'Cause Prepositions',
    tip: 'Nhìn nhanh sau chỗ trống: nếu không có V chia thì -> gạch ngay các liên từ (Because, Although, Since).',
  },
  {
    id: 'ex-toeic-04',
    track_type: 'toeic',
    category: 'Negative Adverb Inversion',
    difficulty: 'advanced',
    type: 'multiple_choice',
    title: 'Đảo ngữ với trạng từ phủ định ở đầu câu',
    question_text: 'Hardly _______ the regional conference room when the keynote speaker started his opening remarks.',
    options: [
      { key: 'A', text: 'we had entered' },
      { key: 'B', text: 'had we entered' },
      { key: 'C', text: 'did we entered' },
      { key: 'D', text: 'have we enter' },
    ],
    correct_answer: 'B',
    explanation_vi: 'Cấu trúc đảo ngữ thì quá khứ hoàn thành: Hardly + had + S + V_p2 + when + S + V_quá_khứ_đơn. Mang nghĩa: "Vừa mới... thì...". Do đó chọn "had we entered".',
    grammar_or_vocab_tag: 'Hardly Inversion',
    tip: 'Hardly/Scarcely + HAD + S + V_p2 ... when ...',
  },
  {
    id: 'ex-toeic-05',
    track_type: 'toeic',
    category: 'Collocations & Prepositions',
    difficulty: 'intermediate',
    type: 'sentence_completion',
    title: 'Cụm giới từ cố định trong thanh toán',
    question_text: 'Payment for the annual software license must be remitted _______ thirty calendar days of invoice issuance.',
    options: [
      { key: 'A', text: 'within' },
      { key: 'B', text: 'between' },
      { key: 'C', text: 'among' },
      { key: 'D', text: 'onto' },
    ],
    correct_answer: 'A',
    explanation_vi: 'Cụm từ quen thuộc trong điều khoản thanh toán (Net 30): "within [number] days of [event]" = trong vòng bao nhiêu ngày kể từ ngày...',
    grammar_or_vocab_tag: 'Preposition of Time Limit',
    tip: 'Within + khoảng thời gian (within 30 days, within a week).',
  },
  {
    id: 'ex-toeic-06',
    track_type: 'toeic',
    category: 'Reduced Relative Clauses',
    difficulty: 'intermediate',
    type: 'multiple_choice',
    title: 'Rút gọn mệnh đề quan hệ dạng bị động',
    question_text: 'The warranty policies _______ on our corporate website apply exclusively to products purchased after January 1.',
    options: [
      { key: 'A', text: 'outlined' },
      { key: 'B', text: 'outlining' },
      { key: 'C', text: 'are outlined' },
      { key: 'D', text: 'outline' },
    ],
    correct_answer: 'A',
    explanation_vi: 'Động từ chính của câu là "apply" (áp dụng). Danh từ "The warranty policies" (các chính sách bảo hành) chịu tác động "được phác thảo/nêu rõ", nên rút gọn từ "which are outlined" thành phân từ bị động "outlined".',
    grammar_or_vocab_tag: 'Passive Reduced Relative Clause',
    tip: 'Vật chịu tác động -> rút gọn thành V-ed/P.P.',
  },
  {
    id: 'ex-toeic-07',
    track_type: 'toeic',
    category: 'Correlative Conjunctions',
    difficulty: 'beginner',
    type: 'multiple_choice',
    title: 'Cặp liên từ tương quan trong tuyển dụng',
    question_text: 'Applicants must possess _______ a bachelor degree in economics or a minimum of three years in financial trading.',
    options: [
      { key: 'A', text: 'either' },
      { key: 'B', text: 'neither' },
      { key: 'C', text: 'both' },
      { key: 'D', text: 'whether' },
    ],
    correct_answer: 'A',
    explanation_vi: 'Phía sau có từ "or", nên ta dùng cặp liên từ tương quan "either ... or" (hoặc là ... hoặc là).',
    grammar_or_vocab_tag: 'Either ... or',
    tip: 'Nhìn thấy "or" -> điền "either"; thấy "nor" -> điền "neither"; thấy "and" -> điền "both".',
  },
  {
    id: 'ex-toeic-08',
    track_type: 'toeic',
    category: 'Business Vocabulary',
    difficulty: 'advanced',
    type: 'multiple_choice',
    title: 'Từ vựng quản trị doanh nghiệp cao cấp',
    question_text: 'The executive committee decided to _______ the merger until the anti-trust regulatory review is resolved.',
    options: [
      { key: 'A', text: 'postpone' },
      { key: 'B', text: 'terminate' },
      { key: 'C', text: 'initiate' },
      { key: 'D', text: 'accelerate' },
    ],
    correct_answer: 'A',
    explanation_vi: 'Dựa vào ngữ cảnh "until the review is resolved" (cho đến khi việc thanh tra được giải quyết), hành động hợp lý nhất là "postpone" (hoãn lại).',
    grammar_or_vocab_tag: 'Business Strategy Vocabulary',
    tip: 'Postpone/Defer = trì hoãn cho đến một mốc thời gian (until).',
  },

  // ─────────────────────────────────────────────────────────────
  // MEDICAL ENGLISH EXERCISES: CLINICAL, PHARMA & ANATOMY
  // ─────────────────────────────────────────────────────────────
  {
    id: 'ex-med-01',
    track_type: 'medical',
    category: 'Clinical Terminology',
    difficulty: 'beginner',
    type: 'multiple_choice',
    title: 'Thuật ngữ giải phẫu lồng ngực & tim',
    question_text: 'A patient complaining of retrosternal discomfort and shortness of breath is evaluated for _______ pathology.',
    options: [
      { key: 'A', text: 'cardiovascular' },
      { key: 'B', text: 'dermatologic' },
      { key: 'C', text: 'orthopedic' },
      { key: 'D', text: 'ophthalmologic' },
    ],
    correct_answer: 'A',
    explanation_vi: 'Triệu chứng "retrosternal discomfort" (khó chịu sau xương ức) và "shortness of breath" (khó thở) là những dấu hiệu điển hình của bệnh lý tim mạch (cardiovascular pathology).',
    grammar_or_vocab_tag: 'Cardiovascular Symptoms',
    tip: 'Retrosternal = sau xương ức, Cardio- = tiền tố liên quan đến tim.',
  },
  {
    id: 'ex-med-02',
    track_type: 'medical',
    category: 'Pharmacology & Prescription',
    difficulty: 'intermediate',
    type: 'multiple_choice',
    title: 'Chống chỉ định thuốc trong thai kỳ',
    question_text: 'Angiotensin receptor blockers are strictly _______ in pregnant women due to potential teratogenic risks to the fetus.',
    options: [
      { key: 'A', text: 'contraindicated' },
      { key: 'B', text: 'recommended' },
      { key: 'C', text: 'indicated' },
      { key: 'D', text: 'prescribed' },
    ],
    correct_answer: 'A',
    explanation_vi: '"Contraindicated" mang nghĩa là chống chỉ định (không được phép sử dụng vì gây nguy hiểm). Nguy cơ gây dị tật thai nhi (teratogenic risks) là lý do bắt buộc chống chỉ định.',
    grammar_or_vocab_tag: 'Pharmacology Contraindications',
    tip: 'Contraindicated in = chống chỉ định đối với.',
  },
  {
    id: 'ex-med-03',
    track_type: 'medical',
    category: 'Emergency & ACLS Protocols',
    difficulty: 'advanced',
    type: 'multiple_choice',
    title: 'Phác đồ cấp cứu sốc phản vệ',
    question_text: 'In severe anaphylaxis presenting with stridor and hypotension, intramuscular _______ is the first-line medication of choice.',
    options: [
      { key: 'A', text: 'epinephrine' },
      { key: 'B', text: 'paracetamol' },
      { key: 'C', text: 'insulin' },
      { key: 'D', text: 'metformin' },
    ],
    correct_answer: 'A',
    explanation_vi: 'Trong sốc phản vệ nặng (anaphylaxis) có thở rít (stridor) và tụt huyết áp (hypotension), Adrenaline/Epinephrine tiêm bắp là thuốc đầu tay cấp cứu số 1.',
    grammar_or_vocab_tag: 'Emergency Medicine ACLS',
    tip: 'Anaphylaxis first-line treatment = Intramuscular Epinephrine (1:1000).',
  },
  {
    id: 'ex-med-04',
    track_type: 'medical',
    category: 'Diagnostic Reporting',
    difficulty: 'intermediate',
    type: 'sentence_completion',
    title: 'Động từ đọc kết quả cận lâm sàng',
    question_text: 'The ultrasound scan _______ no evidence of acute cholecystitis or biliary duct dilatation.',
    options: [
      { key: 'A', text: 'revealed' },
      { key: 'B', text: 'looked' },
      { key: 'C', text: 'watched' },
      { key: 'D', text: 'convinced' },
    ],
    correct_answer: 'A',
    explanation_vi: 'Trong văn phong đọc kết quả chẩn đoán hình ảnh (ultrasound, CT, MRI), người ta dùng "revealed / demonstrated / showed no evidence of..." (cho thấy không có bằng chứng của...).',
    grammar_or_vocab_tag: 'Clinical Reporting Verbs',
    tip: 'Ultrasound / CT scan + revealed / demonstrated + findings.',
  },
  {
    id: 'ex-med-05',
    track_type: 'medical',
    category: 'Surgical Procedures',
    difficulty: 'advanced',
    type: 'multiple_choice',
    title: 'Quy trình phòng mổ & vô khuẩn',
    question_text: 'Prior to creating the abdominal incision, the surgical field was thoroughly _______ with povidone-iodine solution.',
    options: [
      { key: 'A', text: 'disinfected' },
      { key: 'B', text: 'corrupted' },
      { key: 'C', text: 'contaminated' },
      { key: 'D', text: 'postponed' },
    ],
    correct_answer: 'A',
    explanation_vi: 'Trước khi rạch đường mổ, phẫu trường phải được sát khuẩn/khử trùng kỹ lưỡng (disinfected/prepped) bằng dung dịch cồn sát trùng povidone-iodine.',
    grammar_or_vocab_tag: 'Operative Aseptic Technique',
    tip: 'Disinfect / Prep the surgical site = sát trùng phẫu trường.',
  },
  {
    id: 'ex-med-06',
    track_type: 'medical',
    category: 'Doctor - Patient Dialogue',
    difficulty: 'beginner',
    type: 'multiple_choice',
    title: 'Mẫu câu hỏi bệnh sử cơn đau',
    question_text: 'Doctor: "_______ does the pain start, and what makes it better or worse?" Patient: "It started after lunch and worsens when I bend forward."',
    options: [
      { key: 'A', text: 'When' },
      { key: 'B', text: 'Whose' },
      { key: 'C', text: 'Why' },
      { key: 'D', text: 'Whom' },
    ],
    correct_answer: 'A',
    explanation_vi: 'Bệnh nhân trả lời về mốc thời gian "after lunch" (sau bữa trưa), do đó từ để hỏi phù hợp nhất là "When" (khi nào).',
    grammar_or_vocab_tag: 'Medical History Taking',
    tip: 'Hỏi về thời điểm khởi phát triệu chứng: When did the pain start? / How long ago?',
  },
  {
    id: 'ex-med-07',
    track_type: 'medical',
    category: 'Clinical Lab Values',
    difficulty: 'intermediate',
    type: 'multiple_choice',
    title: 'Giải thích chỉ số xét nghiệm huyết học',
    question_text: 'An elevated white blood cell count (leukocytosis) most commonly indicates an ongoing bacterial _______ in the body.',
    options: [
      { key: 'A', text: 'infection' },
      { key: 'B', text: 'fracture' },
      { key: 'C', text: 'abrasion' },
      { key: 'D', text: 'dislocation' },
    ],
    correct_answer: 'A',
    explanation_vi: 'Số lượng bạch cầu tăng cao (leukocytosis) phổ biến nhất là chỉ điểm của tình trạng nhiễm khuẩn (bacterial infection).',
    grammar_or_vocab_tag: 'Hematology Interpretation',
    tip: 'Leukocytosis (tăng bạch cầu) -> Bacterial infection (nhiễm khuẩn).',
  },
  {
    id: 'ex-med-08',
    track_type: 'medical',
    category: 'Discharge & Counseling',
    difficulty: 'beginner',
    type: 'sentence_completion',
    title: 'Dặn dò xuất viện & tuân thủ điều trị',
    question_text: 'Patients are advised to finish their prescribed antibiotic course even if their symptoms have completely _______.',
    options: [
      { key: 'A', text: 'resolved' },
      { key: 'B', text: 'declined' },
      { key: 'C', text: 'refused' },
      { key: 'D', text: 'damaged' },
    ],
    correct_answer: 'A',
    explanation_vi: 'Trong y khoa, khi triệu chứng bệnh thuyên giảm và biến mất hoàn toàn, người ta dùng cụm từ "symptoms have resolved" (triệu chứng đã hết hoàn toàn).',
    grammar_or_vocab_tag: 'Symptom Resolution',
    tip: 'Symptoms resolve / disappeared = hết triệu chứng.',
  },
]

