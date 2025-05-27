export function replaceLineBreak(text: string) {
  if (text) {
    return text.split("\n").map((line: string, i: number) => {
      return (
        <span key={i}>
          {line}
          <br />
        </span>
      );
    });
  }
}
