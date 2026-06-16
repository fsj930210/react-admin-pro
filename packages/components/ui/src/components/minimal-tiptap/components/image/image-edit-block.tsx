import type { Editor } from "@tiptap/react";
import { Button } from "../../../button";
import { Label } from "../../../label";
import { Input } from "../../../input";
import { useCallback, useRef, useState, type ChangeEvent, type FC, type FormEvent } from "react";

interface ImageEditBlockProps {
  editor: Editor;
  close: () => void;
}

export const ImageEditBlock: FC<ImageEditBlockProps> = ({ editor, close }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [link, setLink] = useState("");

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFile = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files?.length) return;

      const insertImages = async () => {
        const contentBucket = [];
        const filesArray = Array.from(files);

        for (const file of filesArray) {
          contentBucket.push({ src: file });
        }

        editor.commands.setImages(contentBucket);
      };

      await insertImages();
      close();
    },
    [editor, close]
  );

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (link) {
        editor.commands.setImages([{ src: link }]);
        close();
      }
    },
    [editor, link, close]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <Label htmlFor="image-link">Attach an image link</Label>
        <div className="flex">
          <Input
            id="image-link"
            type="url"
            required
            placeholder="https://example.com"
            value={link}
            className="grow"
            onChange={(e: ChangeEvent<HTMLInputElement>) => setLink(e.target.value)}
          />
          <Button type="submit" className="ml-2">
            Submit
          </Button>
        </div>
      </div>
      <Button type="button" className="w-full" onClick={handleClick}>
        Upload from your computer
      </Button>
      <input
        type="file"
        accept="image/*"
        aria-label="Upload image files"
        ref={fileInputRef}
        multiple
        className="hidden"
        onChange={handleFile}
      />
    </form>
  );
};

export default ImageEditBlock;
