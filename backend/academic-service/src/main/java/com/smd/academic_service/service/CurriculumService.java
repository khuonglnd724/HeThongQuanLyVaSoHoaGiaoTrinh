package com.smd.academic_service.service;

import com.smd.academic_service.model.dto.CurriculumTreeDto;
import com.smd.academic_service.model.entity.Program;
import com.smd.academic_service.model.entity.Subject;
import com.smd.academic_service.model.entity.Syllabus;
import com.smd.academic_service.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CurriculumService {
    
    private final ProgramRepository programRepository;
    private final SubjectRepository subjectRepository;
    private final SyllabusRepository syllabusRepository;
    private final CloRepository cloRepository;
    private final CloMappingRepository cloMappingRepository;
    
    /**
     * Lấy cấu trúc chương trình dưới dạng Tree View
     * Program -> Subject -> Syllabus + CLO
     */
    public CurriculumTreeDto getCurriculumTree(Long programId) {
        log.debug("Fetching curriculum tree for program id: {}", programId);
        
        Program program = programRepository.findById(programId)
            .orElseThrow(() -> new RuntimeException("Program not found with id: " + programId));
        
        List<Subject> subjects = subjectRepository.findActiveSubjectsByProgramId(programId);
        
        List<CurriculumTreeDto.SubjectNodeDto> subjectNodes = subjects.stream()
            .map(subject -> {
                List<Syllabus> syllabuses = syllabusRepository.findActiveSyllabusesBySubjectId(subject.getId());
                List<CurriculumTreeDto.SyllabusNodeDto> syllabusNodes = syllabuses.stream()
                    .map(s -> CurriculumTreeDto.SyllabusNodeDto.builder()
                        .syllabusId(s.getId())
                        .syllabusCode(s.getSyllabusCode())
                        .version(s.getVersion())
                        .academicYear(s.getAcademicYear())
                        .status(s.getStatus())
                        .approvalStatus(s.getApprovalStatus())
                        .build())
                    .collect(Collectors.toList());
                
                var clos = cloRepository.findActiveClosBySubjectId(subject.getId());
                List<CurriculumTreeDto.CloNodeDto> cloNodes = clos.stream()
                    .map(clo -> {
                        Long mappedPlosCount = cloMappingRepository.countMappedPlosByCloId(clo.getId());
                        return CurriculumTreeDto.CloNodeDto.builder()
                            .cloId(clo.getId())
                            .cloCode(clo.getCloCode())
                            .cloName(clo.getCloName())
                            .bloomLevel(clo.getBloomLevel())
                            .mappedPlos(mappedPlosCount.intValue())
                            .build();
                    })
                    .collect(Collectors.toList());
                
                return CurriculumTreeDto.SubjectNodeDto.builder()
                    .subjectId(subject.getId())
                    .subjectCode(subject.getSubjectCode())
                    .subjectName(subject.getSubjectName())
                    .credits(subject.getCredits())
                    .semester(subject.getSemester())
                    .subjectType(subject.getSubjectType())
                    .syllabuses(syllabusNodes)
                    .clos(cloNodes)
                    .build();
            })
            .collect(Collectors.toList());
        
        return CurriculumTreeDto.builder()
            .programId(program.getId())
            .programCode(program.getProgramCode())
            .programName(program.getProgramName())
            .subjects(subjectNodes)
            .build();
    }
}
