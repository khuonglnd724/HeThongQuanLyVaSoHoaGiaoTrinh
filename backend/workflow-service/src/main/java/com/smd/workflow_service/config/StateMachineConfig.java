package com.smd.workflow_service.config;

import com.smd.workflow_service.domain.WorkflowEvent;
import com.smd.workflow_service.domain.WorkflowState;
import org.springframework.context.annotation.Configuration;
import org.springframework.statemachine.config.EnableStateMachineFactory;
import org.springframework.statemachine.config.EnumStateMachineConfigurerAdapter;
import org.springframework.statemachine.config.builders.StateMachineStateConfigurer;
import org.springframework.statemachine.config.builders.StateMachineTransitionConfigurer;

import java.util.EnumSet;

@Configuration
@EnableStateMachineFactory
public class StateMachineConfig
        extends EnumStateMachineConfigurerAdapter<WorkflowState, WorkflowEvent> {

    @Override
    public void configure(StateMachineStateConfigurer<WorkflowState, WorkflowEvent> states)
            throws Exception {

        states.withStates()
              .initial(WorkflowState.DRAFT)
              .states(EnumSet.allOf(WorkflowState.class));
    }

    @Override
    public void configure(StateMachineTransitionConfigurer<WorkflowState, WorkflowEvent> transitions)
            throws Exception {

        transitions
            .withExternal()
                .source(WorkflowState.DRAFT)
                .target(WorkflowState.REVIEW)
                .event(WorkflowEvent.SUBMIT)
            .and()

            .withExternal()
                .source(WorkflowState.REVIEW)
                .target(WorkflowState.APPROVED)
                .event(WorkflowEvent.APPROVE)
            .and()

            .withExternal()
                .source(WorkflowState.REVIEW)
                .target(WorkflowState.REJECTED)
                .event(WorkflowEvent.REJECT)
            .and()

            .withExternal()
                .source(WorkflowState.REVIEW)
                .target(WorkflowState.DRAFT)
                .event(WorkflowEvent.REQUIRE_EDIT);
    }
}
