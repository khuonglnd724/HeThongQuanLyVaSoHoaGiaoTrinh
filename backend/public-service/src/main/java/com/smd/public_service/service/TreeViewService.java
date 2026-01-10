package com.smd.public_service.service;

import com.smd.public_service.model.entity.Subject;
import com.smd.public_service.model.entity.SubjectRelationship;
import com.smd.public_service.repository.SubjectRelationshipRepository;
import com.smd.public_service.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * TreeViewService - Xây dựng cây môn học
 * Hiển thị mối quan hệ giữa các môn: Môn nào học trước, môn nào học sau
 */
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class TreeViewService {
    
    private final SubjectRepository subjectRepository;
    private final SubjectRelationshipRepository relationshipRepository;
    
    /**
     * DTO cho node trong cây
     */
    public static class SubjectTreeNode {
        public Long id;
        public String code;
        public String name;
        public Integer semester;
        public Integer credits;
        public List<SubjectTreeNode> prerequisites;
        public List<SubjectTreeNode> dependents;
        public String relationshipType;
        
        public SubjectTreeNode() {
            this.prerequisites = new ArrayList<>();
            this.dependents = new ArrayList<>();
        }
    }
    
    /**
     * Lấy cây môn học cho một môn cụ thể
     * Hiển thị: Môn nào học trước (prerequisites) và môn nào học sau (dependents)
     */
    public SubjectTreeNode getSubjectTree(Long subjectId) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found: " + subjectId));
        
        SubjectTreeNode root = convertToNode(subject);
        
        // Lấy prerequisites (môn học nào cần học trước)
        List<Subject> prerequisites = subjectRepository.findPrerequisites(subjectId);
        root.prerequisites = prerequisites.stream()
                .map(this::convertToNode)
                .collect(Collectors.toList());
        
        // Lấy dependents (môn học nào cần học cái này trước)
        List<Subject> dependents = subjectRepository.findDependentSubjects(subjectId);
        root.dependents = dependents.stream()
                .map(this::convertToNode)
                .collect(Collectors.toList());
        
        return root;
    }
    
    /**
     * Lấy cây toàn bộ môn học cho một chương trình
     */
    public SubjectTreeNode getProgramTree(Long programId) {
        List<Subject> allSubjects = subjectRepository.findByProgramId(programId);
        
        // Sắp xếp theo semester
        Map<Integer, List<Subject>> byStudent = allSubjects.stream()
                .collect(Collectors.groupingBy(Subject::getSemester));
        
        // Build tree structure
        SubjectTreeNode root = new SubjectTreeNode();
        root.name = "Program Structure";
        
        return root;
    }
    
    /**
     * Lấy path từ subject này đến subject khác (nếu có quan hệ)
     */
    public List<SubjectTreeNode> getPath(Long fromSubjectId, Long toSubjectId) {
        List<SubjectTreeNode> path = new ArrayList<>();
        Set<Long> visited = new HashSet<>();
        
        dfs(fromSubjectId, toSubjectId, path, visited);
        
        return path;
    }
    
    /**
     * DFS để tìm path
     */
    private boolean dfs(Long current, Long target, List<SubjectTreeNode> path, Set<Long> visited) {
        if (current.equals(target)) {
            Subject subject = subjectRepository.findById(current).orElse(null);
            if (subject != null) {
                path.add(convertToNode(subject));
            }
            return true;
        }
        
        if (visited.contains(current)) {
            return false;
        }
        
        visited.add(current);
        
        // Check all related subjects
        List<SubjectRelationship> relationships = relationshipRepository.findBySubjectId(current);
        
        for (SubjectRelationship rel : relationships) {
            Long nextId = rel.getRelatedSubject().getId();
            if (dfs(nextId, target, path, visited)) {
                Subject subject = subjectRepository.findById(current).orElse(null);
                if (subject != null) {
                    path.add(0, convertToNode(subject));
                }
                return true;
            }
        }
        
        visited.remove(current);
        return false;
    }
    
    /**
     * Convert Subject entity to TreeNode DTO
     */
    private SubjectTreeNode convertToNode(Subject subject) {
        SubjectTreeNode node = new SubjectTreeNode();
        node.id = subject.getId();
        node.code = subject.getSubjectCode();
        node.name = subject.getSubjectName();
        node.semester = subject.getSemester();
        node.credits = subject.getCredits();
        
        return node;
    }
}
