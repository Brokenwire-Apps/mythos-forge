import styled from "styled-components";
import { GridContainer } from "components/Common/Containers";
import { useGlobalWindow } from "hooks/GlobalWindow";
import { useMemo } from "react";
import { Paths } from "routes";
// Grid images
import worlds from "assets/mystic-world.png";
import timelines from "assets/mystic-time.png";
import characters from "assets/mystic-characters.png";
import books from "assets/mystic-books.png";
import { Link } from "react-router-dom";
import PageLayout from "components/Common/PageLayout";

const Container = styled(PageLayout)``;
const Controls = styled(GridContainer)`
  align-self: stretch;
  grid-column-gap: ${({ gap }) => gap};
  height: -webkit-fill-available;
  padding: 0;
`;
const Control = styled(Link)<{ image: string }>`
  border-radius: 8px;
  color: white;
  border: ${({ theme }) =>
    `${theme.sizes.sm} solid ${theme.colors.semitransparent}`};
  font-size: 1.6rem;
  height: 40vh;
  overflow: hidden;
  place-content: center;
  position: relative;

  > * {
    width: 100%;
  }

  .bg {
    background: ${({ image }) =>
      `url(${image}) no-repeat bottom center / cover`};
    display: block;
    filter: blur(0.05rem);
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    z-index: 1;
    @media screen and (max-width: 768px) {
      filter: none;
    }
  }

  &:hover .bg {
    animation: scale-up 150ms ease-in;
    animation-fill-mode: forwards;
    box-shadow: 0 0 0.5rem 0.1rem ${({ theme }) => theme.colors.accent};
    filter: blur(0);
  }

  @media screen and (max-width: 768px) {
    height: 50vh;
  }
`;
const ControlText = styled.span`
  align-self: flex-end;
  background-color: ${({ theme }) => theme.colors.bgColor}aa;
  font-size: 1.6rem;
  font-weight: 500;
  height: 2.8rem;
  line-height: 2.8rem;
  padding: 0 0.3rem;
  z-index: 2;
`;

const SECTIONS = [
  { auth: false, data: Paths.Library, src: books }, // "Books & Series"
  { auth: false, data: Paths.Characters, src: characters }, // "Cast & Characters",
  { auth: false, data: Paths.Worlds, src: worlds }, // "Worlds & settings",
  { auth: true, data: Paths.Timelines, src: timelines } // "Events & Timelines",
];
const Home = () => {
  const { width } = useGlobalWindow();
  const [gridColumns, gridGap] = useMemo(() => {
    if (width > 1024) return [4, "1.2rem"];
    if (width > 700) return [2, "0"];
    return [1, "0"];
  }, [width]);

  return (
    <Container
      id="app-dashboard"
      title="Home"
      description="A forge of myths and legends"
      breadcrumbs={[]}
    >
      <Controls
        className="fill"
        columns={`repeat(${gridColumns},1fr)`}
        gap={gridGap}
      >
        {SECTIONS.map(({ data, src }) => (
          <Control
            className="flex"
            key={data.Index.text}
            to={data.Index.path}
            title={data.Index.text}
            children={
              <>
                <span className="bg" />
                <ControlText>{data.Index.text}</ControlText>
              </>
            }
            image={src}
          />
        ))}
      </Controls>
    </Container>
  );
};

export default Home;
