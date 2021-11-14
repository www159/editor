import { a } from "@react-spring/web";
import styled from "styled-components";

export const Wrapper = styled(a.div)`
  .sheet-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    flex: 8;
    
    .sheet {
      /* background-color: tomato; */
      width: 100%;
      height: 100%;
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      grid-template-rows: repeat(4, minmax(0, 1fr));
    
      /* border: 1px white solid; */
      .emoji {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 5%;
        width: 100%;
        height: 100%;
      }

    }
  }

  .radio-wrapper {
    background-color: wheat;
    flex: 2;
    width: 100%;
    font-size: 0.3em;

    display: flex;
    justify-content: center;
    align-items: center;


    .radio-grid {

      display: grid;
      /* grid-template-columns: repeat(3, 1fr); */
      grid-gap: 5px;

      .radio {
        box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.5);
        background-color: tomato;
        width: 5px;
        height: 5px;
        border-radius: 50%;
      }
    }
  }
`;
