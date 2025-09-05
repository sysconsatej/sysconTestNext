/* eslint-disable */
import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from "react";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import PropTypes from "prop-types";
import { decrypt } from "@/helper/security";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

const SunEditorComponent = forwardRef((props, ref) => {
  const editorRef = useRef(null);
  const [content, setContent] = useState("");

  useEffect(() => {
    if (props.initialContent) {
      setContent(props.initialContent);
    }
  }, [props.initialContent]);

  const handleChange = (content) => {
    setContent(content);
  };

  const handleImageUploadBefore = async (files, info, uploadHandler) => {
    const file = files[0];
    const formData = new FormData();
    formData.append("documents", file);

    const storedUserData = localStorage.getItem("userData");
    const decryptedData = decrypt(storedUserData);
    const userData = JSON.parse(decryptedData);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${baseUrl}/api/master/Upload`, {
        method: "POST",
        headers: {
          "x-access-token": JSON.parse(token),
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        const imagePath = result.data.path;
        uploadHandler({
          result: [
            {
              url: `${baseUrl}/${imagePath}`,
              name: file.name,
              size: file.size,
            },
          ],
        });
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  useImperativeHandle(ref, () => ({
    getContent: () => content,
    setContent: (newContent) => setContent(newContent),
  }));

  const handleEditorLoad = (editor) => {
    editorRef.current = editor;
  };

  return (
    <div className="sun-editor-container">
      <SunEditor
        getSunEditorInstance={handleEditorLoad}
        setContents={content}
        onChange={handleChange}
        onImageUploadBefore={(files, info, uploadHandler) => {
          handleImageUploadBefore(files, info, uploadHandler);
          return false; // Prevent the default behavior of inserting the base64 image
        }}
        setOptions={{
          height: 350,
          buttonList: [
            ["undo", "redo", "font", "fontSize", "formatBlock"],
            [
              "bold",
              "underline",
              "italic",
              "strike",
              "subscript",
              "superscript",
            ],
            ["fontColor", "hiliteColor", "textStyle"],
            ["removeFormat"],
            ["outdent", "indent"],
            ["align", "horizontalRule", "list", "table"],
            ["link", "image", "video"],
            ["fullScreen", "showBlocks", "codeView"],
            ["preview", "print"],
          ],
          resizingBar: false,
          font: [
            "Arial",
            "Georgia",
            "Impact",
            "Tahoma",
            "Verdana",
            "Calibri",
            "Times New Roman",
            "Comic Sans MS",
            "Courier New",
            "Garamond",
            "Palatino Linotype",
            "Trebuchet MS",
          ],
          fontSize: ["8", "10", "12", "14", "16", "18", "24", "36"],
          formats: [
            "p",
            "blockquote",
            "pre",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
          ],
          minHeight: "300px",
          maxHeight: "600px",
          id: "editorContext",
          width: "100%",
          placeholder: "Write something...",
          fontColor: "#333",
          hiliteColor: "#eee",
        }}
        autoFocus={true}
      />
    </div>
  );
});

SunEditorComponent.displayName = "SunEditorComponent";

SunEditorComponent.propTypes = {
  initialContent: PropTypes.string.isRequired,
};

export default SunEditorComponent;
