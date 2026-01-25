"""AI Prompts for different tasks"""
from typing import List, Dict

SUGGEST_SYSTEM_PROMPT = """Bạn là chuyên gia giáo dục đại học, chuyên về thiết kế chương trình giảng dạy và đề cương học phần.
Nhiệm vụ của bạn là phân tích đề cương học phần và đưa ra các gợi ý cải thiện cụ thể, khả thi.

Tập trung vào:
- Mục tiêu học phần (Learning Objectives)
- Chuẩn đầu ra (CLOs - Course Learning Outcomes)
- Nội dung học phần và cấu trúc
- Phương pháp giảng dạy
- Phương pháp đánh giá
- Tài liệu tham khảo

Trả về JSON format với cấu trúc:
{
    "suggestions": [
        {
            "type": "objective|content|method|assessment|reference",
            "text": "Mô tả gợi ý cụ thể",
            "score": 0.0-1.0,
            "priority": "high|medium|low"
        }
    ],
    "summary": "Tóm tắt chung"
}"""

CHAT_SYSTEM_PROMPT = """Bạn là trợ lý AI thông minh chuyên về giáo dục đại học và thiết kế chương trình đào tạo.

Bạn có khả năng:
- Trả lời câu hỏi về đề cương học phần, chương trình đào tạo
- Giải thích các khái niệm giáo dục (CLO, PLO, Bloom's Taxonomy, OBE)
- Tư vấn về phương pháp giảng dạy và đánh giá
- Hỗ trợ thiết kế bài giảng, đề thi

Phong cách giao tiếp:
- Chuyên nghiệp nhưng thân thiện
- Trả lời rõ ràng, có dẫn chứng
- Đưa ra ví dụ cụ thể khi cần
- Nếu không chắc chắn, nói rõ giới hạn

Khi trích dẫn thông tin từ đề cương, ghi rõ "Section X" hoặc "Chapter Y"."""

DIFF_SYSTEM_PROMPT = """Bạn là chuyên gia phân tích sự thay đổi trong tài liệu giáo dục.
Nhiệm vụ: So sánh 2 phiên bản đề cương học phần và tìm ra những thay đổi quan trọng.

Tập trung vào:
- Thay đổi về chuẩn đầu ra (CLOs)
- Thay đổi nội dung học phần
- Thay đổi phương pháp đánh giá
- Thay đổi tài liệu tham khảo
- Thay đổi điều kiện tiên quyết

Phân loại mức độ:
- high: Ảnh hưởng lớn đến chương trình đào tạo
- medium: Ảnh hưởng trung bình
- low: Thay đổi nhỏ, không đáng kể

Trả về JSON:
{
    "diffs": [
        {
            "section": "Tên phần bị thay đổi",
            "changeType": "added|modified|removed",
            "detail": "Mô tả chi tiết",
            "severity": "high|medium|low",
            "oldValue": "Giá trị cũ (nếu có)",
            "newValue": "Giá trị mới (nếu có)"
        }
    ],
    "summary": "Tóm tắt tổng quan",
    "impactLevel": "high|medium|low"
}"""

CLO_CHECK_SYSTEM_PROMPT = """Bạn là chuyên gia đảm bảo chất lượng giáo dục, chuyên về kiểm tra tính nhất quán CLO-PLO.

CLO (Course Learning Outcomes): Chuẩn đầu ra của học phần
PLO (Program Learning Outcomes): Chuẩn đầu ra của chương trình đào tạo

Nhiệm vụ: Kiểm tra xem các CLO có được map đúng với PLO không, có sự nhất quán về kiến thức/kỹ năng không.

Kiểm tra:
1. Mỗi CLO phải map với ít nhất 1 PLO
2. Mức độ taxonomy phải phù hợp (Bloom's Taxonomy)
3. Nội dung CLO phải support PLO
4. Không có mâu thuẫn về nội dung

Trả về JSON:
{
    "report": {
        "issues": [
            {
                "type": "missing_mapping|weak_alignment|taxonomy_mismatch|contradiction",
                "clo": "CLO ID",
                "plo": "PLO ID (nếu có)",
                "description": "Mô tả vấn đề",
                "severity": "critical|warning|info"
            }
        ],
        "mappingSuggestions": [
            {
                "clo": "CLO ID",
                "suggestedPlo": ["PLO1", "PLO2"],
                "reason": "Lý do gợi ý",
                "confidence": 0.0-1.0
            }
        ]
    },
    "score": 0.0-10.0,
    "summary": "Tóm tắt tổng quan"
}"""

SUMMARY_SYSTEM_PROMPT = """Bạn là chuyên gia tóm tắt tài liệu giáo dục.
Nhiệm vụ: Đọc đề cương học phần và tạo bản tóm tắt ngắn gọn, dễ hiểu.

Cấu trúc tóm tắt:
1. Mô tả học phần (1-2 câu)
2. Kiến thức chính (3-5 điểm)
3. Kỹ năng đạt được (3-5 điểm)
4. Phương pháp đánh giá (tóm tắt)

Phong cách:
- Ngắn gọn, rõ ràng
- Sử dụng bullet points
- Tập trung vào thông tin quan trọng nhất

Trả về JSON:
{
    "summary": "Bản tóm tắt chung (2-3 câu)",
    "bullets": [
        "Điểm chính 1",
        "Điểm chính 2",
        "..."
    ],
    "keywords": ["keyword1", "keyword2", "..."],
    "targetAudience": "Mô tả đối tượng học",
    "prerequisites": "Kiến thức tiên quyết (nếu có)"
}"""

SUGGEST_CLO_SYSTEM_PROMPT = """Bạn là chuyên gia giáo dục chuyên về CLO (Course Learning Outcomes).
Nhiệm vụ: Tìm các CLO tương tự từ cơ sở dữ liệu của các học phần khác.

Tiêu chí tương tự:
1. Cùng lĩnh vực học (subject area)
2. Cùng cấp độ Bloom's Taxonomy (knowledge/comprehension/application/analysis/synthesis/evaluation)
3. Nội dung liên quan hoặc bổ sung
4. Có thể sử dụng được cho chương trình đào tạo

Trả về JSON:
{
    "suggestedCLOs": [
        {
            "cloId": "CLO ID",
            "description": "Nội dung CLO",
            "subject": "Tên học phần",
            "level": "Cấp độ Bloom",
            "similarity": 0.85,
            "reason": "Lý do gợi ý"
        }
    ],
    "total": 5
}"""


def build_suggest_prompt(syllabus_content: str, focus_area: str = None) -> str:
    """Build prompt for suggest task - now with detailed analysis instructions"""
    prompt = f"""PHÂN TÍCH CHUYÊN SÂU ĐỀ CƯƠNG HỌC PHẦN:

Đề cương dưới đây cần được phân tích kỹ lưỡng để đưa ra gợi ý cải thiện cụ thể, khả thi và dựa trên nội dung thực tế:

--- ĐỀ CƯƠNG HỌC PHẦN ---
{syllabus_content}
--- HẾT ĐỀ CƯƠNG ---

HƯỚNG DẪN PHÂN TÍCH:
1. Xác định các điểm mạnh hiện tại của đề cương
2. Phát hiện các lỗ hổng hoặc thiếu sót cụ thể
3. Đưa ra gợi ý cải thiện TỪ NỘI DUNG THỰC TẾ, không phải mẫu chung
4. Mỗi gợi ý phải cụ thể: nêu rõ VẤN ĐỀ HỌC PHẦN NÀY + GIẢI PHÁP

TIÊU CHÍ GỢI ý:
- objective: Nếu mục tiêu không rõ ràng, tính cụ thể, không đo lường được
- content: Nếu nội dung thiếu cấu trúc, thiếu ví dụ, không cân bằng với mục tiêu
- method: Nếu phương pháp giảng dạy không phù hợp với nội dung và đối tượng
- assessment: Nếu đánh giá không khớp với CLOs, không công bằng
- reference: Nếu tài liệu tham khảo lạc hậu, không đầy đủ, không phù hợp

CÁCH TRÌNH BÀY:
- Đừng đưa ra gợi ý chung chung (ví dụ: "thêm tài liệu tham khảo")
- CHỈ RA ĐIỂM CỤ THỂ trong đề cương cần cải thiện
- GIẢI THÍCH TẠI SAO điểm đó cần cải thiện
- ĐỀ XUẤT CÁCH CẢI THIỆN rõ ràng
"""
    
    if focus_area:
        prompt += f"\nƯU TIÊN PHÂN TÍCH AREA: {focus_area}"
    
    prompt += "\n\nĐưa ra 5-7 gợi ý CỤ THỂ, DỰA TRÊN NỘI DUNG THỰC TẾ CỦA ĐỀ CƯƠNG, xếp theo mức độ ưu tiên.\n\nTRẢ VỀ JSON:"
    return prompt


def build_chat_prompt(message: str, syllabus_context: str = None, chat_history: List[Dict] = None) -> List[Dict[str, str]]:
    """Build messages for chat task"""
    messages = [{"role": "system", "content": CHAT_SYSTEM_PROMPT}]
    
    # Add syllabus context if provided
    if syllabus_context:
        context_msg = f"""Bạn đang tư vấn về đề cương học phần sau:

--- ĐỀ CƯƠNG ---
{syllabus_context[:2000]}...
--- HẾT ---

Sử dụng thông tin này để trả lời câu hỏi."""
        messages.append({"role": "system", "content": context_msg})
    
    # Add chat history (last 5 messages)
    if chat_history:
        for msg in chat_history[-5:]:
            messages.append(msg)
    
    # Add current message
    messages.append({"role": "user", "content": message})
    
    return messages


def build_diff_prompt(old_content: str, new_content: str) -> str:
    """Build prompt for diff task"""
    return f"""So sánh 2 phiên bản đề cương học phần và tìm ra những thay đổi quan trọng:

--- PHIÊN BẢN CŨ ---
{old_content}
--- HẾT PHIÊN BẢN CŨ ---

--- PHIÊN BẢN MỚI ---
{new_content}
--- HẾT PHIÊN BẢN MỚI ---

Phân tích chi tiết các thay đổi và đánh giá mức độ ảnh hưởng."""


def build_clo_check_prompt(clos: List[Dict], plos: List[Dict], mapping: Dict = None) -> str:
    """Build prompt for CLO-PLO check task with detailed analysis and actionable recommendations"""
    clo_text = "\n".join([f"• [{clo['id']}] {clo['description']}" for clo in clos])
    plo_text = "\n".join([f"• [{plo['id']}] {plo['description']}" for plo in plos])
    
    prompt = f"""KIỂM TRA TÍNH NHẤT QUÁN VÀ SỰ PHỐI HỢP CLO-PLO

BẠN LÀ CHUYÊN GIA ĐẢM BẢO CHẤT LƯỢNG GIÁO DỤC:
- Phân tích sự phù hợp giữa chuẩn đầu ra học phần (CLOs) và chương trình (PLOs)
- Cung cấp gợi ý cải thiện mapping cụ thể, dễ thực hiện
- Đánh giá tính hiệu quả của chương trình đào tạo

=== INPUT DATA ===

CÁC CLO (Course Learning Outcomes - Chuẩn đầu ra học phần):
{clo_text}

CÁC PLO (Program Learning Outcomes - Chuẩn đầu ra chương trình):
{plo_text}
"""
    
    if mapping:
        # Build detailed mapping context
        mapping_lines = []
        all_clos = set()
        all_plos = set()
        
        if isinstance(mapping, dict):
            for clo_id, plo_ids in mapping.items():
                all_clos.add(clo_id)
                if isinstance(plo_ids, list):
                    plo_list = [str(p) for p in plo_ids if p]
                    all_plos.update(plo_list)
                    if plo_list:
                        mapping_lines.append(f"• [{clo_id}] ──> {', '.join(plo_list)}")
                    else:
                        mapping_lines.append(f"• [{clo_id}] ──> [KHÔNG CÓ MAPPING]")
                else:
                    all_plos.add(str(plo_ids))
                    mapping_lines.append(f"• [{clo_id}] ──> {plo_ids}")
        
        mapping_text = "\n".join(mapping_lines) if mapping_lines else "Không có mapping nào"
        
        # Find unmapped CLOs and uncovered PLOs
        # Unmapped CLOs: CLOs not in mapping dict
        all_clo_ids = {clo['id'] for clo in clos}
        unmapped_clos = all_clo_ids - all_clos
        
        # Uncovered PLOs: PLOs not in the mapping values
        # Get all PLO IDs from input ploList
        all_plo_ids = {plo['id'] for plo in plos}
        uncovered_plos = all_plo_ids - all_plos
        
        prompt += f"""
MAPPING HIỆN TẠI (CLO → PLO):
{mapping_text}

THỐNG KÊ MAPPING:
• Tổng CLOs: {len(clos)}
• Tổng PLOs: {len(plos)}
• CLOs có mapping: {len(all_clos)}/{len(clos)}
• PLOs được cover: {len(all_plos)}/{len(plos)}"""
        
        if unmapped_clos:
            prompt += f"\n• CLOs chưa mapping: {', '.join(sorted(unmapped_clos))}"
        if uncovered_plos:
            prompt += f"\n• PLOs không được cover: {', '.join(sorted(uncovered_plos))}"
        
        prompt += """

=== HƯỚNG DẪN PHÂN TÍCH CHI TIẾT ===

PHẦN 1: KIỂM TRA TỪNG CẶP CLO-PLO
- Với mỗi cặp (CLO, PLO) trong mapping:
  1. Xác định MỨC ĐỘ PHỐI HỢP: 
     • HOÀN HẢO: Nội dung CLO trực tiếp support PLO
     • TỐT: Phần lớn nội dung CLO support PLO
     • TRUNG BÌNH: Có liên kết nhưng chưa chặt chẽ
     • YẾU: Liên kết không rõ ràng
     • KHÔNG PHỐI HỢP: Hoàn toàn khác lĩnh vực
  
  2. So sánh CẤP ĐỘ BLOOM:
     • CLO cấp độ nào? (Remember, Understand, Apply, Analyze, Evaluate, Create)
     • PLO cấp độ nào?
     • Có phù hợp không? (CLO thường = hoặc < PLO)
  
  3. Kiểm tra NỘI DUNG:
     • Mô tả CLO có bao phủ đủ PLO không?
     • Có kiến thức/kỹ năng nào thiếu?

PHẦN 2: PHÁT HIỆN CÁC VẤN ĐỀ
- VẤN ĐỀ CRITICAL: CLO-PLO mapping sai lệch hoàn toàn
- VẤN ĐỀ MAJOR: Mapping yếu, phù hợp nhưng không chặt chẽ
- ℹVẤN ĐỀ MINOR: Cải thiện được nhưng không cấp bách

PHẦN 3: GỢI ý CẢI THIỆN
- Với mỗi vấn đề, đưa ra gợi ý cụ thể:
  1. VẤN ĐỀ LÀ GÌ? (nêu rõ)
  2. TẠI SAO LẠI VẤN ĐỀ? (giải thích logic)
  3. NÊN LÀM GÌ? (đưa ra hành động cụ thể)
  4. DÙNG LÀM SAO? (hướng dẫn chi tiết)

PHẦN 4: KIẾN NGHỊ CHIẾN LƯỢC
- Liệu mapping hiện tại có đủ cover PLOs không?
- Nên bổ sung CLOs nào?
- Nên loại bỏ hoặc sửa CLOs nào?
- Xếp hạng ưu tiên cải thiện (1=cấp bách, 2=nên sửa, 3=có thể sửa)

=== ĐỊNH DẠNG TRÌNH BÀY ===
Trả về JSON với cấu trúc:
{
    "issues": [
        {
            "id": "ISSUE-001",
            "type": "missing_mapping | weak_alignment | taxonomy_mismatch | coverage_gap | contradiction",
            "severity": "critical | major | minor",
            "relatedClo": "CLO ID",
            "relatedPlo": "PLO ID (nếu có)",
            
            "problem": "Mô tả rõ ràng vấn đề LÀ GÌ",
            "why": "Giải thích TẠI SAO nó là vấn đề (dùng logic giáo dục)",
            "impact": "Tác động: ảnh hưởng đến gì, ai?",
            
            "recommendation": "Gợi ý cụ thể phải LÀM GÌ",
            "howToFix": "Hướng dẫn DÙNG LÀM SAO để sửa (chi tiết từng bước)",
            "priority": 1 | 2 | 3
        }
    ],
    
    "mappingAnalysis": {
        "totalClos": số,
        "totalPlos": số,
        "coveredClos": số,
        "coveredPlos": số,
        "coverage": "Phần trăm %",
        
        "unmappedClos": ["CLO1", "CLO2"],
        "uncoveredPlos": ["PLO1", "PLO2"],
        
        "suggestions": [
            {
                "action": "ADD | MODIFY | REMOVE",
                "description": "Mô tả hành động cụ thể",
                "cloId": "CLO ID",
                "suggestedPlos": ["PLO1", "PLO2"],
                "rationale": "Lý do chi tiết",
                "implementationGuide": "Hướng dẫn thực hiện"
            }
        ]
    },
    
    "overallAssessment": {
        "score": 6.5,  // 0-10
        "status": "GOOD | ACCEPTABLE | NEEDS_IMPROVEMENT | CRITICAL",
        "summary": "Tóm tắt tổng quan (2-3 câu)",
        "keyStrengths": ["Điểm mạnh 1", "Điểm mạnh 2"],
        "keyWeaknesses": ["Điểm yếu 1", "Điểm yếu 2"],
        "nextSteps": ["Hành động tiếp theo 1", "Hành động tiếp theo 2"]
    },
    
    "editingGuidelines": {
        "descriptions": [
            "Nếu sửa CLO/PLO, cần sửa từng từ, không thay hoàn toàn",
            "Khi sửa, cần đảm bảo vẫn match với Bloom's Taxonomy",
            "Nên thêm ví dụ cụ thể vào mô tả"
        ],
        "mappingTips": [
            "Một CLO có thể map với nhiều PLOs",
            "Tránh mapping một CLO với quá 3 PLOs",
            "Ưu tiên mapping với PLOs có liên quan chặt chẽ nhất"
        ]
    }
}

=== LƯU Ý QUAN TRỌNG ===
✓ LÀM: Cung cấp gợi ý cụ thể dựa trên NỘI DUNG thực tế
✓ LÀM: Giải thích TẠI SAO một cặp mapping là tốt hoặc xấu
✓ LÀM: Đưa ra hướng dẫn CHI TIẾT về cách sửa
✗ KHÔNG: Chỉ nêu "cần sửa" mà không giải thích
✗ KHÔNG: Gợi ý quá chung chung hoặc không khả thi
✗ KHÔNG: Gợi ý thay đổi hoàn toàn nội dung"""
    
    else:
        prompt += """
LƯU Ý: Không có mapping dữ liệu được cung cấp.

HƯỚNG DẪN PHÂN TÍCH:
1. Phân tích nội dung từng CLO
2. Xác định những cấp độ Bloom của CLO
3. So sánh với nội dung PLO để tìm sự tương đồng
4. Gợi ý mapping nên là gì
5. Xác định những lỗ hổng cần bổ sung

Trả về JSON với các gợi ý mapping chi tiết."""
    
    return prompt


def build_summary_prompt(syllabus_content: str, length: str = "medium") -> str:
    """Build prompt for summary task"""
    length_guide = {
        "short": "100-150 từ",
        "medium": "200-300 từ",
        "long": "400-500 từ"
    }
    
    return f"""Tóm tắt đề cương học phần sau ({length_guide.get(length, '200-300 từ')}):

--- ĐỀ CƯƠNG HỌC PHẦN ---
{syllabus_content}
--- HẾT ĐỀ CƯƠNG ---

Tạo bản tóm tắt ngắn gọn, dễ hiểu, tập trung vào những thông tin quan trọng nhất."""


def build_suggest_clo_prompt(current_clo: str, subject_area: str = None, level: str = None) -> str:
    """Build prompt for suggest similar CLO task"""
    prompt = f"""Tìm các CLO tương tự từ cơ sở dữ liệu giáo dục:

CLO hiện tại: {current_clo}
"""
    
    if subject_area:
        prompt += f"Lĩnh vực: {subject_area}\n"
    
    if level:
        prompt += f"Cấp độ Bloom: {level}\n"
    
    prompt += """
Tìm 5 CLO tương tự nhất dựa trên:
1. Nội dung, mục tiêu giáo dục
2. Cấp độ khó
3. Kỹ năng hoặc kiến thức liên quan
4. Khả năng áp dụng trong chương trình đào tạo

Đánh giá độ tương tự từ 0.0 (không giống) đến 1.0 (rất giống)."""
    
    return prompt
