/// <reference types="cypress" />
describe('math extension', () => {
    
    context('inline-math', () => {
        it('before generate', () => {
            cy.visit('localhost:3000')
        })
        
        it('using inputrule 1', () => {
            cy.get('.editor').as('myEditor')
            cy.get('@myEditor').type('$ ')
            cy.get('.math-node')
            .not('be.null')
            .and('have.class', 'ProseMirror-selectednode')
            .children('.math-src')
            .should('match', 'span')
        })

        it('type something to test preview', () => {
            cy.get('.editor')
            .type('{rightarrow}')
            .get('.math-node')
            .should('have.class', 'empty-math')
            .get('.editor')
            .type('{leftarrow}a+b\\times c')
            .find('.math-preview')
            .should('not.be.null')
        })

        it('delete inline-math', () => {
            cy.get('.editor')
            .type('{rightarrow}')
            .type('{backspace}')
            .get('div')
            .should('not.have.class', 'math-node')
        })
    })

    context('block math', () => {
        it('using inputrule', () => {
            cy.get('.editor')
            .type('{enter}')
            .type('$$ ')
            .get('math-dispaly')
            .should('not.be.null')
        })

        it('type some tex', () => {
            cy.get(',editor')
            .type('\\frac{x + y}{c}')
        })

        it('delete block-math', () => {
            cy.get('.editor')
            .type('{rightarrow}{backspace}')
            .get('div')
            .should('not.have.class', 'math-node')
        })
    })
})