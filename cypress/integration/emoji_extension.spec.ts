import cypress from "cypress";

describe('emoji extension', () => {

    // beforeEach(() => {
        
    // })

    context('emoji input', () => {
        it('wake emojibar', () => {
            cy.visit('http://localhost:3000')
            // cy.visit('/')
            cy.get('.editor').type('{movetoend}').type(':: ')
            cy.get('.emoji').should('have.length.at.least', 15)
        })

        it('arrow choose', () => {
            cy.get('.editor').type('{enter}')
            cy.get('.emoji-select').not('be.none').contains(String.fromCodePoint(0x1f600))

            cy.get('.editor').type('{leftarrow}')
            cy.get('.emoji-select').contains(String.fromCodePoint(0x1f635))
            cy.get('.emoji').should('have.length.at.least', 8)
        })

        it('choose', () => {
            cy.get('.editor').type('{enter}')
            .get('emoji').should('have.length.at.least', 1)
        })

        it('force exit', () => {
            cy.get('.editor').type('{leftarrow}')
            .get('.emoji-bar-wrapper').not('be.none')
            cy.get('.editor').type('{ctrl+leftarrow}')
            .get('div').should('not.have.class', '.emoji')

            cy.get('.editor').type('{rightarrow}')
            .get('.emoji-bar-wrapper').not('be.none')

            cy.get('.editor').type('{ctrl+rightarrow}')
            .get('div').should('not.have.class', '.emoji')
            
        })
    })
})