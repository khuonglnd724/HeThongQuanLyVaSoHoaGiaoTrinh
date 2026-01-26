package com.smd.syllabus.mq;

import com.smd.syllabus.domain.Syllabus;

public final class SyllabusEventFactory {
    private SyllabusEventFactory() {}

    public static SyllabusEvent of(String type, Syllabus s, String actorId) {
        SyllabusEvent e = new SyllabusEvent();
        e.setType(type);
        e.setSyllabusId(s.getId());
        e.setRootId(s.getRootId());
        e.setVersionNo(s.getVersionNo());
        e.setActorId(actorId);
        e.setSubjectCode(s.getSubjectCode());
        e.setSubjectName(s.getSubjectName());
        return e;
    }
}
